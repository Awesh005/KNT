"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignSchema = exports.createCampaignSchema = void 0;
const zod_1 = require("zod");
exports.createCampaignSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5),
        category: zod_1.z.string().min(2),
        story: zod_1.z.string().min(20),
        cover_image: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        target_amount: zod_1.z.number().positive(),
        deadline: zod_1.z.string().datetime(), // ISO 8601 string
        status: zod_1.z.enum(['pending', 'approved', 'rejected', 'closed']).optional(),
        is_urgent: zod_1.z.boolean().optional(),
        is_featured: zod_1.z.boolean().optional(),
        video_url: zod_1.z.string().url().optional().nullable(),
        account_holder_name: zod_1.z.string().optional().nullable(),
        account_number: zod_1.z.string().optional().nullable(),
    })
});
exports.updateCampaignSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(), // Extracted from URL, it's string, we'll parse to int
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(5).optional(),
        category: zod_1.z.string().min(2).optional(),
        story: zod_1.z.string().min(20).optional(),
        cover_image: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        target_amount: zod_1.z.number().positive().optional(),
        deadline: zod_1.z.string().datetime().optional(),
        status: zod_1.z.enum(['pending', 'approved', 'rejected', 'closed']).optional(),
        is_urgent: zod_1.z.boolean().optional(),
        is_featured: zod_1.z.boolean().optional(),
        video_url: zod_1.z.string().url().optional().nullable(),
        account_holder_name: zod_1.z.string().optional().nullable(),
        account_number: zod_1.z.string().optional().nullable(),
        latitude: zod_1.z.number().min(-90).max(90).optional().nullable(),
        longitude: zod_1.z.number().min(-180).max(180).optional().nullable(),
        location_label: zod_1.z.string().max(255).optional().nullable(),
        program_key: zod_1.z.string().max(120).optional().nullable(),
        sdg_tags: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional().nullable(),
        student_details: zod_1.z.any().optional().nullable(),
    })
});
