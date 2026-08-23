import { z } from 'zod';

export const updateJobApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid application id'),
  }),
  body: z.object({
    status: z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'hired']),
  }),
});

export const jobApplicationIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid application id'),
  }),
});
