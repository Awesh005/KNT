"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationIdSchema = exports.updateJobApplicationStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateJobApplicationStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'Invalid application id'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'hired']),
    }),
});
exports.jobApplicationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'Invalid application id'),
    }),
});
