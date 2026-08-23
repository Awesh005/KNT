import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess } from '../../utils/response';
import { logger } from '../../config/logger';

export const paymentController = {
  config(_req: Request, res: Response) {
    sendSuccess(res, 200, paymentService.config(), 'Payment config');
  },

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || null;
      const order = await paymentService.createOrder(req.body, userId);
      sendSuccess(res, 201, order, 'SBI checkout created');
    } catch (error) {
      next(error);
    }
  },

  async sbiReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const enc = (req.body?.encData || req.body?.EncryptTrans || req.query.encData || '') as string;
      const redirectTo = await paymentService.handleSbiReturn(enc);
      res.redirect(302, redirectTo);
    } catch (error: any) {
      logger.error('SBI return handling failed', error?.message || error);
      next(error);
    }
  },

  async sbiWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const enc = (req.body?.encData || req.body?.EncryptTrans || '') as string;
      await paymentService.handleSbiReturn(enc);
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  },

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await paymentService.getPublicStatus(req.params.id as string);
      sendSuccess(res, 200, data, 'Donation status');
    } catch (error) {
      next(error);
    }
  },

  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.refund(req.params.id as string, req.body?.reason || 'Admin refund');
      sendSuccess(res, 200, result, 'Refund recorded');
    } catch (error) {
      next(error);
    }
  },
};
