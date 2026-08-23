import { Request, Response, NextFunction } from 'express';
import { internApplicationService } from './intern-application.service';
import { sendSuccess } from '../../utils/response';

export const internApplicationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const application = await internApplicationService.create({
        ...req.body,
        resume_url: file ? `/uploads/applications/${file.filename}` : null,
      });
      sendSuccess(res, 201, { application }, 'Internship application submitted');
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = await internApplicationService.list(req.query.status as string);
      sendSuccess(res, 200, { applications }, 'Internship applications fetched');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await internApplicationService.updateStatus(
        parseInt(req.params.id as string, 10),
        req.body.status
      );
      sendSuccess(res, 200, { application }, 'Status updated');
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await internApplicationService.remove(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, null, 'Application deleted');
    } catch (error) {
      next(error);
    }
  },
};
