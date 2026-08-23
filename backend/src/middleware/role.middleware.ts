import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return next(new ForbiddenError(`Role (${userRole}) is not allowed to access this resource`));
    }
    
    next();
  };
};
