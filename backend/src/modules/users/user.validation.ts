import { z } from 'zod';

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    role: z.enum(['Guest', 'Donor', 'Requester', 'Admin', 'Super Admin']),
  })
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['active', 'inactive', 'suspended']),
  })
});

export const createAdminSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })
});

export const updateAdminSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).optional().or(z.literal('')),
  })
});
