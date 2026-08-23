import { z } from 'zod';

const createRequestSchema = z.object({
  body: z.object({
    beneficiary_name: z.string().min(2),
    category: z.string().min(2),
    story: z.string().min(20),
    target_amount: z.number().positive(),
    deadline: z.string().datetime(),
    documents: z.array(z.string()).optional(), // Array of document paths
    account_holder_name: z.string().min(2, "Account holder name is required"),
    account_number: z.string().min(5, "Account number is required"),
  })
});

const payload = {
  body: {
    beneficiary_name: "John Doe",
    category: "Medical",
    story: "Help me. Help me. Help me. Help me. Help me.",
    target_amount: 10000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    account_holder_name: "John",
    account_number: "12345",
    documents: ['/uploads/requests/req-doc-1.png']
  }
};

const res = createRequestSchema.safeParse(payload);
console.log(res.success ? "Success" : res.error.errors);
