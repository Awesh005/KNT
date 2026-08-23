import fs from 'fs';
import path from 'path';
import { donationModel } from './donation.model';
import { NotFoundError, AppError, ValidationError } from '../../utils/errors';
import { randomUUID as uuidv4 } from 'crypto';
import { pool } from '../../config/database';
import { mailService } from '../../services/mail.service';

export const donationService = {
  async createDonation(data: any, userId: string | null) {
    if (!userId && (!data.donor_name || !data.donor_email)) {
      throw new ValidationError('Name and email are required for guest donations');
    }

    if (data.screenshot_base64) {
      const base64Data = data.screenshot_base64.replace(/^data:image\/\w+;base64,/, "");
      const extension = data.screenshot_base64.split(';')[0].split('/')[1] || 'png';
      const fileName = `screenshot_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const uploadPath = path.join(__dirname, '../../../uploads/screenshots');
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      fs.writeFileSync(path.join(uploadPath, fileName), base64Data, 'base64');
      data.screenshot_url = `/uploads/screenshots/${fileName}`;
    }

    const donationId = 'DON-' + uuidv4().split('-')[0].toUpperCase();
    const campaignId = data.campaign_id === '' || data.campaign_id === undefined || data.campaign_id === null
      ? null
      : Number(data.campaign_id);

    await donationModel.createDonation(donationId, {
      ...data,
      donor_id: userId,
      campaign_id: campaignId && !Number.isNaN(campaignId) ? campaignId : null,
      guest_name: data.donor_name || null,
      guest_email: data.donor_email || null,
      guest_phone: data.donor_phone || null,
      guest_pan: data.donor_pan ? data.donor_pan : null,
      guest_address: data.donor_address || null,
      guest_city: data.donor_city || null,
      guest_state: data.donor_state || null,
      guest_pincode: data.donor_pincode || null,
      payment_mode: data.payment_mode || 'UPI',
    });

    const donation = await this.getDonationById(donationId);
    void mailService.sendDonationReceived(donation);
    return donation;
  },

  async finalizeVerified(id: string, paymentRef?: string) {
    const current = await this.getDonationById(id);
    if (current.status === 'verified') return current;
    const donation = await this.updateDonationStatus(id, 'verified', paymentRef);
    const { documentService } = await import('../documents/document.service');
    try {
      const receipt = await documentService.generateReceipt(donation.id);
      const updated = await this.getDonationById(donation.id);
      if (updated.guest_pan || updated.guestPan) {
        try {
          await documentService.generate80G(donation.id);
        } catch (error) {
          console.error('80G auto-generate skipped:', error);
        }
      }
      void mailService.sendDonationVerified(updated, receipt?.pdf_url);
    } catch (error) {
      console.error('Post-verify documents failed:', error);
    }
    return this.getDonationById(id);
  },

  async getPublicStats() {
    return donationModel.getPublicStats();
  },

  async getDonations(query: any, donorId?: string) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: any = { limit, offset };
    if (query.status) filters.status = query.status;
    if (donorId) filters.donor_id = donorId;
    if (query.campaignId) filters.campaign_id = query.campaignId;

    const { donations: rawDonations, total } = await donationModel.getDonations(filters);

    const donations = rawDonations.map((d: any) => ({
      id: d.id,
      donorId: d.donor_id,
      campaignId: d.campaign_id,
      amount: d.amount,
      tipAmount: d.tip_amount,
      paymentRef: d.payment_ref,
      screenshotUrl: d.screenshot_url,
      status: d.status,
      donatedAt: d.donated_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      donorName: d.donor_name,
      donorEmail: d.donor_email,
      donorMobile: d.donor_mobile,
      donorRole: d.donor_role,
      campaignTitle: d.campaign_title,
      receiptUrl: d.receipt_url,
      guestPan: d.guest_pan,
      guestAddress: d.guest_address,
      guestCity: d.guest_city,
      guestState: d.guest_state,
      guestPincode: d.guest_pincode,
      paymentMode: d.payment_mode,
      certificateUrl: d.certificate_url,
      certificateNo: d.certificate_no,
    }));

    return {
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getDonationById(id: string) {
    const donation = await donationModel.getDonationById(id);
    if (!donation) throw new NotFoundError('Donation not found');
    return donation;
  },

  async updateDonationStatus(id: string, status: string, paymentRef?: string) {
    const donation = await this.getDonationById(id);
    if (status === 'refunded') {
      if (donation.status !== 'verified') {
        throw new AppError('Only verified donations can be refunded', 400);
      }
    } else if (donation.status !== 'pending' && donation.status !== status) {
      throw new AppError(`Cannot update status of a ${donation.status} donation`, 400);
    }
    
    if (donation.status === status) {
      return donation;
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (paymentRef !== undefined && paymentRef !== donation.payment_ref) {
        await connection.query('UPDATE donations SET status = ?, payment_ref = ? WHERE id = ?', [status, paymentRef, id]);
      } else {
        await connection.query('UPDATE donations SET status = ? WHERE id = ?', [status, id]);
      }

      if (status === 'verified' && donation.campaign_id) {
        await connection.query(
          'UPDATE campaigns SET raised_amount = raised_amount + ? WHERE id = ?',
          [donation.amount, donation.campaign_id]
        );
      }

      if (status === 'refunded' && donation.campaign_id) {
        await connection.query(
          'UPDATE campaigns SET raised_amount = GREATEST(raised_amount - ?, 0) WHERE id = ?',
          [donation.amount, donation.campaign_id]
        );
      }

      await connection.commit();
      return await this.getDonationById(id);
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      throw error;
    } finally {
      connection.release();
    }
  },

  async deleteDonation(id: string) {
    const donation = await this.getDonationById(id);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      // 1. If verified and linked to campaign, deduct amount
      if (donation.status === 'verified' && donation.campaign_id) {
        await connection.query(
          'UPDATE campaigns SET raised_amount = raised_amount - ? WHERE id = ?',
          [donation.amount, donation.campaign_id]
        );
      }

      // 2. Delete receipt row if exists (to avoid foreign key constraint issues if not cascade)
      await connection.query('DELETE FROM receipts WHERE donation_id = ?', [id]);

      // 3. Delete the donation
      await connection.query('DELETE FROM donations WHERE id = ?', [id]);

      await connection.commit();

      // 4. Cleanup files
      if (donation.screenshot_url) {
        const screenshotPath = path.join(__dirname, '../../..', donation.screenshot_url);
        if (fs.existsSync(screenshotPath)) {
          fs.unlinkSync(screenshotPath);
        }
      }

      if (donation.receipt_url) {
        const receiptPath = path.join(__dirname, '../../..', donation.receipt_url);
        if (fs.existsSync(receiptPath)) {
          fs.unlinkSync(receiptPath);
        }
      }

      return true;
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      throw error;
    } finally {
      connection.release();
    }
  }
};
