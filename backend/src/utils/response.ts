import { Response } from 'express';

interface SuccessResponse<T> {
  status: 'success';
  data?: T;
  message?: string;
}

interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  errors?: any;
}

export const sendSuccess = <T>(res: Response, statusCode: number, data?: T, message?: string) => {
  const response: SuccessResponse<T> = {
    status: 'success',
  };

  if (data) response.data = data;
  if (message) response.message = message;

  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, statusCode: number, message: string, errors?: any) => {
  const response: ErrorResponse = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};
