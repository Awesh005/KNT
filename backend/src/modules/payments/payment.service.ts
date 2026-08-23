import { donationService } from '../donations/donation.service';
import { paymentModel } from './payment.model';
import { buildCheckoutForm, decryptSbiPayload, doubleVerify, requestSbiRefund, sbiConfigured, sbiPublicConfig } from './sbi.gateway';
import { ValidationError, AppError, NotFoundError } from '../../utils/errors';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export const paymentService = {
  config() {
    return sbiPublicConfig();
  },

  async createOrder(body: any, userId: string | null) {
    if (!sbiConfigured()) {
      throw new ValidationError('SBI ePay is not configured yet. Please use UPI screenshot payment.');
    }
    if (!body.donor_name || !body.donor_email) {
      throw new ValidationError('Name and email are required');
    }
    const amount = Number(body.amount) || 0;
    const tip = Number(body.tip_amount) || 0;
    if (amount < 1) throw new ValidationError('Amount must be greater than 0');

    const donation = await donationService.createDonation({
      ...body,
      payment_mode: 'SBI_EPAY',
      payment_ref: 'SBI-PENDING',
    }, userId);

    const total = amount + tip;
    await paymentModel.createOrder({
      donation_id: donation.id,
      merchant_order_no: donation.id,
      amount: total,
    });
    await paymentModel.stampDonationGateway(donation.id, {
      gateway: 'sbi_epay',
      gateway_order_no: donation.id,
    });

    const checkout = buildCheckoutForm({
      donationId: donation.id,
      amount: total,
      name: body.donor_name,
      email: body.donor_email,
      phone: body.donor_phone,
      city: body.donor_city,
      state: body.donor_state,
      pincode: body.donor_pincode,
      otherDetails: `KNT donation ${donation.id}`,
    });

    return {
      donationId: donation.id,
      amount: total,
      ...checkout,
    };
  },

  async handleSbiReturn(encData: string) {
    if (!encData) throw new ValidationError('Missing SBI response');
    const parsed = decryptSbiPayload(encData);
    const orderNo = parsed.merchantOrderNo;
    const order = await paymentModel.getByOrderNo(orderNo);
    if (!order) throw new NotFoundError('Payment order not found');

    await paymentModel.updateOrder(orderNo, {
      raw_response: parsed.raw,
      status: parsed.success ? 'success' : 'failed',
    });
    await paymentModel.stampDonationGateway(order.donation_id, {
      gateway_ref: parsed.sbiRef || null,
      gateway_payload: parsed,
    });

    if (parsed.success) {
      const current = await donationService.getDonationById(order.donation_id);
      if (current.status !== 'verified') {
        const dv = await doubleVerify(orderNo, Number(order.amount));
        const dvOk = !dv || (dv as any).success !== false;
        if (dvOk) {
          await donationService.finalizeVerified(order.donation_id, parsed.sbiRef || orderNo);
          await paymentModel.updateOrder(orderNo, { verified_at: new Date(), status: 'verified' });
        }
      }
    } else if ((await donationService.getDonationById(order.donation_id)).status === 'pending') {
      await donationService.updateDonationStatus(order.donation_id, 'failed', parsed.sbiRef || undefined);
    }

    const client = env.CLIENT_URL.replace(/\/$/, '');
    return `${client}/donate/status/${order.donation_id}`;
  },

  async getPublicStatus(donationId: string) {
    const donation = await donationService.getDonationById(donationId);
    return {
      id: donation.id,
      status: donation.status,
      amount: donation.amount,
      paymentMode: donation.payment_mode,
      campaignTitle: donation.campaign_title,
    };
  },

  async refund(donationId: string, reason: string) {
    const donation = await donationService.getDonationById(donationId);
    if (donation.status !== 'verified') {
      throw new AppError('Only verified donations can be refunded', 400);
    }
    const order = await paymentModel.getByDonation(donationId);
    let gateway = { submitted: false, localOnly: true as boolean };
    try {
      gateway = await requestSbiRefund(
        donation.gateway_order_no || donationId,
        donation.gateway_ref || donation.payment_ref,
        Number(donation.amount) + Number(donation.tip_amount || 0),
        reason
      );
    } catch (error: any) {
      logger.error('SBI refund API error', error?.message || error);
    }
    await donationService.updateDonationStatus(donationId, 'refunded', donation.payment_ref);
    return { donationId, ...gateway };
  },
};
