"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donorStatementSchema = exports.donorTagsSchema = exports.donorNoteSchema = void 0;
const zod_1 = require("zod");
exports.donorNoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        note: zod_1.z.string().min(2),
        follow_up_at: zod_1.z.string().optional().nullable(),
    }),
});
exports.donorTagsSchema = zod_1.z.object({
    body: zod_1.z.object({
        tags: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.donorStatementSchema = zod_1.z.object({
    body: zod_1.z.object({
        fy: zod_1.z.string().optional(),
        email: zod_1.z.boolean().optional(),
    }),
});
