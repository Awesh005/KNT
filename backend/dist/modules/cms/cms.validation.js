"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsUpdateSchema = void 0;
const zod_1 = require("zod");
exports.cmsUpdateSchema = zod_1.z.object({
    params: zod_1.z.object({
        pageKey: zod_1.z.string().min(1).max(100),
        sectionKey: zod_1.z.string().min(1).max(100),
    }),
    body: zod_1.z.object({
        content: zod_1.z.union([zod_1.z.record(zod_1.z.string(), zod_1.z.any()), zod_1.z.array(zod_1.z.any())]),
    })
});
