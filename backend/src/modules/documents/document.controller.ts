import { Request, Response, NextFunction } from 'express';
import { documentService } from './document.service';
import { sendSuccess } from '../../utils/response';

export const documentController = {
  async generateReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const receipt = await documentService.generateReceipt(req.params.donationId as string);
      sendSuccess(res, 201, { receipt }, 'Receipt generated successfully');
    } catch (error) {
      next(error);
    }
  },

  async generate80GCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const regenerate = req.query.regenerate === 'true';
      const certificate = await documentService.generate80G(req.params.donationId as string, { regenerate });
      sendSuccess(res, 201, { certificate }, regenerate ? '80G Certificate regenerated successfully' : '80G Certificate generated successfully');
    } catch (error) {
      next(error);
    }
  }
};
