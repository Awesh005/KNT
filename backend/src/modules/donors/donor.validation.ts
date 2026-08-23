import { z } from 'zod';

export const donorNoteSchema = z.object({
  body: z.object({
    note: z.string().min(2),
    follow_up_at: z.string().optional().nullable(),
  }),
});

export const donorTagsSchema = z.object({
  body: z.object({
    tags: z.array(z.string()),
  }),
});

export const donorStatementSchema = z.object({
  body: z.object({
    fy: z.string().optional(),
    email: z.boolean().optional(),
  }),
});
