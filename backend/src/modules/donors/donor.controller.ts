import { Request, Response, NextFunction } from 'express';
import { donorService } from './donor.service';
import { sendSuccess } from '../../utils/response';

export const donorController = {
  async listDonors(req: Request, res: Response, next: NextFunction) {
    try {
      const donors = await donorService.listDonors(req.query);
      sendSuccess(res, 200, { donors }, 'Donors fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await donorService.exportCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="knt-donors.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async getDonor(req: Request, res: Response, next: NextFunction) {
    try {
      const donor = await donorService.getDonor(req.params.key as string);
      sendSuccess(res, 200, { donor }, 'Donor fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async addNote(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user || {};
      const donor = await donorService.addNote(req.params.key as string, req.body, {
        id: user.id,
        name: user.name,
      });
      sendSuccess(res, 201, { donor }, 'Note added');
    } catch (error) {
      next(error);
    }
  },

  async setTags(req: Request, res: Response, next: NextFunction) {
    try {
      const donor = await donorService.setTags(req.params.key as string, req.body.tags || []);
      sendSuccess(res, 200, { donor }, 'Tags updated');
    } catch (error) {
      next(error);
    }
  },

  async generateStatement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = req.body.email
        ? await donorService.emailAnnualStatement(req.params.key as string, req.body.fy)
        : await donorService.generateAnnualStatement(req.params.key as string, req.body.fy);
      sendSuccess(res, 201, result, req.body.email ? 'Statement emailed' : 'Statement generated');
    } catch (error) {
      next(error);
    }
  },

  async emailAllStatements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await donorService.emailAllStatements(req.body.fy);
      sendSuccess(res, 200, result, 'Annual statements processed');
    } catch (error) {
      next(error);
    }
  },
};
