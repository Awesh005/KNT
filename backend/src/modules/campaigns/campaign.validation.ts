import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    category: z.string().min(2),
    story: z.string().min(20),
    cover_image: z.union([z.string(), z.array(z.string())]).optional(),
    target_amount: z.number().positive(),
    deadline: z.string().datetime(), // ISO 8601 string
    status: z.enum(['pending', 'approved', 'rejected', 'closed']).optional(),
    is_urgent: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    video_url: z.string().url().optional().nullable(),
    account_holder_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
  })
});

export const updateCampaignSchema = z.object({
  params: z.object({
    id: z.string(), // Extracted from URL, it's string, we'll parse to int
  }),
  body: z.object({
    title: z.string().min(5).optional(),
    category: z.string().min(2).optional(),
    story: z.string().min(20).optional(),
    cover_image: z.union([z.string(), z.array(z.string())]).optional(),
    target_amount: z.number().positive().optional(),
    deadline: z.string().datetime().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'closed']).optional(),
    is_urgent: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    video_url: z.string().url().optional().nullable(),
    account_holder_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    location_label: z.string().max(255).optional().nullable(),
    program_key: z.string().max(120).optional().nullable(),
    sdg_tags: z.union([z.string(), z.array(z.string())]).optional().nullable(),
    student_details: z.any().optional().nullable(),
  })
});
