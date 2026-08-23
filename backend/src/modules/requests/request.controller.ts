import { Request, Response, NextFunction } from 'express';
import { requestService } from './request.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/errors';

export const requestController = {
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const requestRecord = await requestService.createRequest(req.body, userId);
      sendSuccess(res, 201, { request: requestRecord }, 'Fundraiser request submitted successfully');
    } catch (error) {
      next(error);
    }
  },

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);
      const fileUrl = `/uploads/requests/${req.file.filename}`;
      sendSuccess(res, 200, { fileUrl }, 'File uploaded successfully');
    } catch (error) {
      next(error);
    }
  },

  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await requestService.getRequests(req.query);
      sendSuccess(res, 200, data, 'Requests fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const data = await requestService.getRequests(req.query, userId);
      sendSuccess(res, 200, data, 'Your requests fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const requestRecord = await requestService.getRequestById(req.params.id as string, userId, userRole);
      sendSuccess(res, 200, { request: requestRecord }, 'Request fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestRecord = await requestService.updateRequestStatus(req.params.id as string, req.body.status, req.body.admin_remarks);
      sendSuccess(res, 200, { request: requestRecord }, 'Request status updated successfully');
    } catch (error) {
      next(error);
    }
  }
};
