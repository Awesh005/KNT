import { z } from 'zod';

export const cmsUpdateSchema = z.object({
  params: z.object({
    pageKey: z.string().min(1).max(100),
    sectionKey: z.string().min(1).max(100),
  }),
  body: z.object({
    content: z.union([z.record(z.string(), z.any()), z.array(z.any())]),
  })
});
