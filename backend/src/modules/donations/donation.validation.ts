import { z } from 'zod';

export const createDonationSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be greater than 0'),
    tip_amount: z.number().min(0).optional(),
    campaign_id: z.union([z.string(), z.number()]).optional().nullable(),
    payment_ref: z.string().optional(),
    screenshot_base64: z.string().optional(),
    screenshot_url: z.string().url('Must be a valid URL').optional(),
    donor_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    donor_email: z.string().email('Invalid email address').optional(),
    donor_phone: z.string().min(8, 'Enter a valid phone number').optional(),
    donor_pan: z.string().optional().transform((value) => (value || '').trim().toUpperCase()).refine(
      (value) => value === '' || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value),
      { message: 'PAN must be in AAAAA9999A format' }
    ),
    donor_address: z.string().optional(),
    donor_city: z.string().optional(),
    donor_state: z.string().optional(),
    donor_pincode: z.string().optional(),
    payment_mode: z.string().optional(),
  }).refine(data => data.payment_ref || data.screenshot_url || data.screenshot_base64, {
    message: "Either payment reference or screenshot URL must be provided",
    path: ["payment_ref"]
  })
});

export const updateDonationStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['verified', 'failed']),
    paymentRef: z.string().optional(),
  })
});
