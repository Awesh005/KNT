import { Request, Response, NextFunction } from 'express';
import { impactService } from './impact.service';
import { impactModel } from './impact.model';
import { sendSuccess } from '../../utils/response';

export const impactController = {
  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const publicOnly = !['Admin', 'Super Admin'].includes((req as any).user?.role);
      const project = await impactService.getProject(parseInt(req.params.id as string, 10), publicOnly);
      sendSuccess(res, 200, project, 'Project fetched');
    } catch (error) {
      next(error);
    }
  },

  async addBeneficiary(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await impactService.addBeneficiary(parseInt(req.params.id as string, 10), req.body);
      sendSuccess(res, 201, { id }, 'Beneficiary added');
    } catch (error) {
      next(error);
    }
  },

  async deleteBeneficiary(req: Request, res: Response, next: NextFunction) {
    try {
      await impactModel.deleteBeneficiary(parseInt(req.params.beneficiaryId as string, 10));
      sendSuccess(res, 200, null, 'Beneficiary removed');
    } catch (error) {
      next(error);
    }
  },

  async addUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await impactService.addUpdate(parseInt(req.params.id as string, 10), req.body);
      sendSuccess(res, 201, { id }, 'Update posted');
    } catch (error) {
      next(error);
    }
  },

  async deleteUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      await impactModel.deleteUpdate(parseInt(req.params.updateId as string, 10));
      sendSuccess(res, 200, null, 'Update removed');
    } catch (error) {
      next(error);
    }
  },

  async listUpdates(req: Request, res: Response, next: NextFunction) {
    try {
      const updates = await impactModel.listUpdates(parseInt(req.params.id as string, 10), true);
      sendSuccess(res, 200, { updates }, 'Updates fetched');
    } catch (error) {
      next(error);
    }
  },

  async beneficiaries(req: Request, res: Response, next: NextFunction) {
    try {
      const beneficiaries = await impactService.listAllBeneficiaries();
      sendSuccess(res, 200, { beneficiaries }, 'Beneficiaries fetched');
    } catch (error) {
      next(error);
    }
  },

  async sdg(req: Request, res: Response, next: NextFunction) {
    try {
      const sdg = await impactService.sdg();
      sendSuccess(res, 200, { sdg }, 'SDG dashboard fetched');
    } catch (error) {
      next(error);
    }
  },

  async csr(req: Request, res: Response, next: NextFunction) {
    try {
      const csr = await impactService.csr();
      sendSuccess(res, 200, { csr }, 'CSR view fetched');
    } catch (error) {
      next(error);
    }
  },

  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await impactService.overview();
      sendSuccess(res, 200, overview, 'Insights overview fetched');
    } catch (error) {
      next(error);
    }
  },
};
