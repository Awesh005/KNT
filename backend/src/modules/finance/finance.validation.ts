import { z } from 'zod';

export const createHeadSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    type: z.enum(['income', 'expense']),
    description: z.string().optional(),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    head_id: z.coerce.number(),
    amount: z.coerce.number().positive(),
    expense_date: z.string().min(8),
    program_id: z.coerce.number().optional().nullable(),
    campaign_id: z.coerce.number().optional().nullable(),
    voucher_no: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const createBudgetSchema = z.object({
  body: z.object({
    title: z.string().min(2),
    allocated: z.coerce.number().min(0),
    fy: z.string().optional(),
    program_id: z.coerce.number().optional().nullable(),
    campaign_id: z.coerce.number().optional().nullable(),
    notes: z.string().optional(),
  }),
});
