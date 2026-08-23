"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAdminSchema = exports.createAdminSchema = exports.updateStatusSchema = exports.updateRoleSchema = void 0;
const zod_1 = require("zod");
exports.updateRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        role: zod_1.z.enum(['Guest', 'Donor', 'Requester', 'Admin', 'Super Admin']),
    })
});
exports.updateStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['active', 'inactive', 'suspended']),
    })
});
exports.createAdminSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    })
});
exports.updateAdminSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6).optional().or(zod_1.z.literal('')),
    })
});
