"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBudgetSchema = exports.createExpenseSchema = exports.createHeadSchema = void 0;
const zod_1 = require("zod");
exports.createHeadSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        type: zod_1.z.enum(['income', 'expense']),
        description: zod_1.z.string().optional(),
    }),
});
exports.createExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        head_id: zod_1.z.coerce.number(),
        amount: zod_1.z.coerce.number().positive(),
        expense_date: zod_1.z.string().min(8),
        program_id: zod_1.z.coerce.number().optional().nullable(),
        campaign_id: zod_1.z.coerce.number().optional().nullable(),
        voucher_no: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.createBudgetSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(2),
        allocated: zod_1.z.coerce.number().min(0),
        fy: zod_1.z.string().optional(),
        program_id: zod_1.z.coerce.number().optional().nullable(),
        campaign_id: zod_1.z.coerce.number().optional().nullable(),
        notes: zod_1.z.string().optional(),
    }),
});
