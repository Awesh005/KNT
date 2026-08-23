"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDonationStatusSchema = exports.createDonationSchema = void 0;
const zod_1 = require("zod");
exports.createDonationSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().positive('Amount must be greater than 0'),
        tip_amount: zod_1.z.number().min(0).optional(),
        campaign_id: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional().nullable(),
        payment_ref: zod_1.z.string().optional(),
        screenshot_base64: zod_1.z.string().optional(),
        screenshot_url: zod_1.z.string().url('Must be a valid URL').optional(),
        donor_name: zod_1.z.string().min(2, 'Name must be at least 2 characters').optional(),
        donor_email: zod_1.z.string().email('Invalid email address').optional(),
        donor_phone: zod_1.z.string().min(8, 'Enter a valid phone number').optional(),
        donor_pan: zod_1.z.string().optional().transform((value) => (value || '').trim().toUpperCase()).refine((value) => value === '' || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value), { message: 'PAN must be in AAAAA9999A format' }),
        donor_address: zod_1.z.string().optional(),
        donor_city: zod_1.z.string().optional(),
        donor_state: zod_1.z.string().optional(),
        donor_pincode: zod_1.z.string().optional(),
        payment_mode: zod_1.z.string().optional(),
    }).refine(data => data.payment_ref || data.screenshot_url || data.screenshot_base64, {
        message: "Either payment reference or screenshot URL must be provided",
        path: ["payment_ref"]
    })
});
exports.updateDonationStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['verified', 'failed']),
        paymentRef: zod_1.z.string().optional(),
    })
});
