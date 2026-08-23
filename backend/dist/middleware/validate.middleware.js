"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                console.error("Zod Validation Error:", error.issues);
                const issues = error.issues || [];
                const errorMessages = issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                console.error('Validation Error Details:', errorMessages);
                next(new errors_1.ValidationError('Invalid request data', errorMessages));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validate = validate;
