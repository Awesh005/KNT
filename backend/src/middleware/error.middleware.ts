import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = err as AppError;

  // Log error
  if (error.isOperational && error.statusCode && error.statusCode < 500) {
    logger.warn(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  } else {
    logger.error(`${error.status || '500'} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    if (env.NODE_ENV === 'development') {
      logger.error(err.stack);
    }
  }

  // If it's a known operational error, send standard response
  if (error.isOperational) {
    return sendError(res, error.statusCode, error.message, (error as any).errors);
  }

  // Programming or other unknown error: don't leak error details in production
  const statusCode = 500;
  const message = env.NODE_ENV === 'development' ? err.message : 'Something went very wrong!';
  
  return sendError(res, statusCode, message);
};
