import { z } from 'zod';

export const createEnquirySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().min(10),
  })
});

export const updateEnquiryStatusSchema = z.object({
  params: z.object({
    id: z.string(), // Extracted from URL as string
  }),
  body: z.object({
    status: z.enum(['new', 'in-progress', 'resolved']),
  })
});
