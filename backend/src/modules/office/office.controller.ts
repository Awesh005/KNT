import { Request, Response, NextFunction } from 'express';
import { officeService } from './office.service';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';

export const officeController = {
  async listFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req as any).user?.role;
      const admin = ['Admin', 'Super Admin'].includes(role);
      const data = await officeService.listFiles(req.query, role, admin);
      sendSuccess(res, 200, data, 'Files fetched');
    } catch (error) {
      next(error);
    }
  },

  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('File is required');
      const file = await officeService.registerUpload(req.file, req.body, (req as any).user?.id);
      sendSuccess(res, 201, { file }, 'File registered');
    } catch (error) {
      next(error);
    }
  },

  async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await officeService.updateFile(req.params.id as string, req.body);
      sendSuccess(res, 200, { file }, 'File updated');
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      await officeService.deleteFile(req.params.id as string);
      sendSuccess(res, 200, null, 'File deleted');
    } catch (error) {
      next(error);
    }
  },

  async listTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = await officeService.listTemplates();
      sendSuccess(res, 200, { templates }, 'Templates fetched');
    } catch (error) {
      next(error);
    }
  },

  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await officeService.createTemplate(req.body);
      sendSuccess(res, 201, { id }, 'Template saved');
    } catch (error) {
      next(error);
    }
  },

  async dispatchLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const letter = await officeService.dispatchLetter(req.body, (req as any).user?.id);
      sendSuccess(res, 201, { letter }, 'Letter dispatched');
    } catch (error) {
      next(error);
    }
  },

  async listLetters(req: Request, res: Response, next: NextFunction) {
    try {
      const letters = await officeService.listLetters(req.query.search as string);
      sendSuccess(res, 200, { letters }, 'Letters fetched');
    } catch (error) {
      next(error);
    }
  },

  async sendLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await officeService.sendLetter(req.params.id as string, req.body.channel);
      sendSuccess(res, 200, result, 'Send logged');
    } catch (error) {
      next(error);
    }
  },

  async listSends(req: Request, res: Response, next: NextFunction) {
    try {
      const sends = await officeService.listSends(req.query.letter_id as string);
      sendSuccess(res, 200, { sends }, 'Send log fetched');
    } catch (error) {
      next(error);
    }
  },

  async getSeal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await officeService.getSeal();
      sendSuccess(res, 200, data, 'Seal fetched');
    } catch (error) {
      next(error);
    }
  },

  async uploadSeal(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new ValidationError('Seal image is required');
      const data = await officeService.setSeal(req.file);
      sendSuccess(res, 200, data, 'Seal uploaded');
    } catch (error) {
      next(error);
    }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await officeService.verify(req.params.code as string);
      sendSuccess(res, 200, result, result.valid ? 'Valid' : 'Invalid');
    } catch (error) {
      next(error);
    }
  },
};
