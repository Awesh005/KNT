import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };

    // Attach user to request
    (req as any).user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token. Please log in again.'));
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
      (req as any).user = { id: decoded.id, role: decoded.role };
    }
  } catch (error) {
    // Ignore token errors for optional auth
  }
  next();
};
