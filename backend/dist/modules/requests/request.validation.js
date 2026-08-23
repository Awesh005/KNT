"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStatusSchema = exports.createRequestSchema = void 0;
const zod_1 = require("zod");
exports.createRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        beneficiary_name: zod_1.z.string().min(2),
        category: zod_1.z.string().min(2),
        story: zod_1.z.string().min(2),
        target_amount: zod_1.z.number().positive(),
        deadline: zod_1.z.string().datetime(),
        cover_images: zod_1.z.array(zod_1.z.string()).min(1), // Array of cover image paths
        documents: zod_1.z.array(zod_1.z.string()).optional(), // Array of document paths
        account_holder_name: zod_1.z.string().min(2, "Account holder name is required"),
        account_number: zod_1.z.string().min(3, "Account number is required"),
    })
});
exports.updateRequestStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['approved', 'rejected', 'needs_revision']),
        admin_remarks: zod_1.z.string().optional(),
    })
});
