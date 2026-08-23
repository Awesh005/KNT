import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Zod Validation Error:", error.issues);
        const issues = error.issues || [];
        const errorMessages = issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        console.error('Validation Error Details:', errorMessages);
        next(new ValidationError('Invalid request data', errorMessages));
      } else {
        next(error);
      }
    }
  };
};
