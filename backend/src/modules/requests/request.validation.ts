import { z } from 'zod';

export const createRequestSchema = z.object({
  body: z.object({
    beneficiary_name: z.string().min(2),
    category: z.string().min(2),
    story: z.string().min(2),
    target_amount: z.number().positive(),
    deadline: z.string().datetime(),
    cover_images: z.array(z.string()).min(1), // Array of cover image paths
    documents: z.array(z.string()).optional(), // Array of document paths
    account_holder_name: z.string().min(2, "Account holder name is required"),
    account_number: z.string().min(3, "Account number is required"),
  })
});

export const updateRequestStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected', 'needs_revision']),
    admin_remarks: z.string().optional(),
  })
});
