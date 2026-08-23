"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const donation_service_1 = require("../donations/donation.service");
const payment_model_1 = require("./payment.model");
const sbi_gateway_1 = require("./sbi.gateway");
const errors_1 = require("../../utils/errors");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
exports.paymentService = {
    config() {
        return (0, sbi_gateway_1.sbiPublicConfig)();
    },
    async createOrder(body, userId) {
        if (!(0, sbi_gateway_1.sbiConfigured)()) {
            throw new errors_1.ValidationError('SBI ePay is not configured yet. Please use UPI screenshot payment.');
        }
        if (!body.donor_name || !body.donor_email) {
            throw new errors_1.ValidationError('Name and email are required');
        }
        const amount = Number(body.amount) || 0;
        const tip = Number(body.tip_amount) || 0;
        if (amount < 1)
            throw new errors_1.ValidationError('Amount must be greater than 0');
        const donation = await donation_service_1.donationService.createDonation({
            ...body,
            payment_mode: 'SBI_EPAY',
            payment_ref: 'SBI-PENDING',
        }, userId);
        const total = amount + tip;
        await payment_model_1.paymentModel.createOrder({
            donation_id: donation.id,
            merchant_order_no: donation.id,
            amount: total,
        });
        await payment_model_1.paymentModel.stampDonationGateway(donation.id, {
            gateway: 'sbi_epay',
            gateway_order_no: donation.id,
        });
        const checkout = (0, sbi_gateway_1.buildCheckoutForm)({
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
    async handleSbiReturn(encData) {
        if (!encData)
            throw new errors_1.ValidationError('Missing SBI response');
        const parsed = (0, sbi_gateway_1.decryptSbiPayload)(encData);
        const orderNo = parsed.merchantOrderNo;
        const order = await payment_model_1.paymentModel.getByOrderNo(orderNo);
        if (!order)
            throw new errors_1.NotFoundError('Payment order not found');
        await payment_model_1.paymentModel.updateOrder(orderNo, {
            raw_response: parsed.raw,
            status: parsed.success ? 'success' : 'failed',
        });
        await payment_model_1.paymentModel.stampDonationGateway(order.donation_id, {
            gateway_ref: parsed.sbiRef || null,
            gateway_payload: parsed,
        });
        if (parsed.success) {
            const current = await donation_service_1.donationService.getDonationById(order.donation_id);
            if (current.status !== 'verified') {
                const dv = await (0, sbi_gateway_1.doubleVerify)(orderNo, Number(order.amount));
                const dvOk = !dv || dv.success !== false;
                if (dvOk) {
                    await donation_service_1.donationService.finalizeVerified(order.donation_id, parsed.sbiRef || orderNo);
                    await payment_model_1.paymentModel.updateOrder(orderNo, { verified_at: new Date(), status: 'verified' });
                }
            }
        }
        else if ((await donation_service_1.donationService.getDonationById(order.donation_id)).status === 'pending') {
            await donation_service_1.donationService.updateDonationStatus(order.donation_id, 'failed', parsed.sbiRef || undefined);
        }
        const client = env_1.env.CLIENT_URL.replace(/\/$/, '');
        return `${client}/donate/status/${order.donation_id}`;
    },
    async getPublicStatus(donationId) {
        const donation = await donation_service_1.donationService.getDonationById(donationId);
        return {
            id: donation.id,
            status: donation.status,
            amount: donation.amount,
            paymentMode: donation.payment_mode,
            campaignTitle: donation.campaign_title,
        };
    },
    async refund(donationId, reason) {
        const donation = await donation_service_1.donationService.getDonationById(donationId);
        if (donation.status !== 'verified') {
            throw new errors_1.AppError('Only verified donations can be refunded', 400);
        }
        const order = await payment_model_1.paymentModel.getByDonation(donationId);
        let gateway = { submitted: false, localOnly: true };
        try {
            gateway = await (0, sbi_gateway_1.requestSbiRefund)(donation.gateway_order_no || donationId, donation.gateway_ref || donation.payment_ref, Number(donation.amount) + Number(donation.tip_amount || 0), reason);
        }
        catch (error) {
            logger_1.logger.error('SBI refund API error', error?.message || error);
        }
        await donation_service_1.donationService.updateDonationStatus(donationId, 'refunded', donation.payment_ref);
        return { donationId, ...gateway };
    },
};
