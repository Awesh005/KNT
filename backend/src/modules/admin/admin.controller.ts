import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../utils/response';

export const adminController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminService.getNotifications();
      sendSuccess(res, 200, data, 'Notifications fetched successfully');
    } catch (error) {
      next(error);
    }
  },
};
