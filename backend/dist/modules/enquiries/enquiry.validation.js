"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnquiryStatusSchema = exports.createEnquirySchema = void 0;
const zod_1 = require("zod");
exports.createEnquirySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        message: zod_1.z.string().min(10),
    })
});
exports.updateEnquiryStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(), // Extracted from URL as string
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['new', 'in-progress', 'resolved']),
    })
});
