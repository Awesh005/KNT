import { Request, Response, NextFunction } from 'express';
import { commsModel } from './comms.model';
import { sendSuccess } from '../../utils/response';

export const commsController = {
  async templates(_req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await commsModel.listTemplates();
      sendSuccess(res, 200, { templates }, 'Mail templates fetched');
    } catch (error) {
      next(error);
    }
  },

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await commsModel.updateTemplate(req.params.key as string, req.body);
      sendSuccess(res, 200, { template }, 'Template saved');
    } catch (error) {
      next(error);
    }
  },

  async log(_req: Request, res: Response, next: NextFunction) {
    try {
      const log = await commsModel.listLog();
      sendSuccess(res, 200, { log }, 'Mail log fetched');
    } catch (error) {
      next(error);
    }
  },
};
