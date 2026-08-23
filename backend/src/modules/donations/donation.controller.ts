import { Request, Response, NextFunction } from 'express';
import { donationService } from './donation.service';
import { documentService } from '../documents/document.service';
import { sendSuccess } from '../../utils/response';
import { NotFoundError, AppError } from '../../utils/errors';
import { mailService } from '../../services/mail.service';

export const donationController = {
  async getPublicStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await donationService.getPublicStats();
      sendSuccess(res, 200, stats, 'Donation stats fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async createDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || null;
      const donation = await donationService.createDonation(req.body, userId);
      sendSuccess(res, 201, { donation }, 'Donation recorded successfully');
    } catch (error) {
      next(error);
    }
  },

  async getDonations(req: Request, res: Response, next: NextFunction) {
    try {
      // Admin sees all donations, we pass query filters
      const data = await donationService.getDonations(req.query);
      sendSuccess(res, 200, data, 'Donations fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMyDonations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await donationService.getDonations(req.query, userId);
      sendSuccess(res, 200, data, 'Your donations fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getDonationById(req: Request, res: Response, next: NextFunction) {
    try {
      const donation = await donationService.getDonationById(req.params.id as string);
      sendSuccess(res, 200, { donation }, 'Donation fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async verifyDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const donation = await donationService.updateDonationStatus(req.params.id as string, req.body.status, req.body.paymentRef);
      
      if (req.body.status === 'verified') {
        const receipt = await documentService.generateReceipt(donation.id);
        const updated = await donationService.getDonationById(donation.id);
        if (updated.guest_pan || updated.guestPan) {
          try {
            await documentService.generate80G(donation.id);
          } catch (error) {
            console.error('80G auto-generate skipped:', error);
          }
        }
        void mailService.sendDonationVerified(updated, receipt?.pdf_url);
      }

      sendSuccess(res, 200, { donation }, 'Donation status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteDonation(req: Request, res: Response, next: NextFunction) {
    try {
      await donationService.deleteDonation(req.params.id as string);
      res.json({
        status: 'success',
        message: 'Donation deleted successfully'
      });
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof AppError) {
        return next(error);
      }
      console.error('Error deleting donation:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
};
