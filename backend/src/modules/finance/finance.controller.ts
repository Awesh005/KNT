import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service';
import { sendSuccess } from '../../utils/response';

export const financeController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.getDashboard(req.query.fy as string);
      sendSuccess(res, 200, data, 'Finance dashboard fetched');
    } catch (error) {
      next(error);
    }
  },

  async getRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const donations = await financeService.getRegister(req.query);
      sendSuccess(res, 200, { donations }, 'Donation register fetched');
    } catch (error) {
      next(error);
    }
  },

  async exportRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await financeService.exportRegisterCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="donation-register.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  async getHeads(req: Request, res: Response, next: NextFunction) {
    try {
      const heads = await financeService.getHeads();
      sendSuccess(res, 200, { heads }, 'Heads fetched');
    } catch (error) {
      next(error);
    }
  },

  async createHead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await financeService.createHead(req.body);
      sendSuccess(res, 201, { id }, 'Head created');
    } catch (error) {
      next(error);
    }
  },

  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const expenses = await financeService.getExpenses(req.query);
      sendSuccess(res, 200, { expenses }, 'Expenses fetched');
    } catch (error) {
      next(error);
    }
  },

  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await financeService.createExpense(req.body, (req as any).user?.id);
      sendSuccess(res, 201, { expense }, 'Expense recorded');
    } catch (error) {
      next(error);
    }
  },

  async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      await financeService.deleteExpense(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, null, 'Expense deleted');
    } catch (error) {
      next(error);
    }
  },

  async getBudgets(req: Request, res: Response, next: NextFunction) {
    try {
      const budgets = await financeService.getBudgets(req.query.fy as string);
      sendSuccess(res, 200, { budgets }, 'Budgets fetched');
    } catch (error) {
      next(error);
    }
  },

  async createBudget(req: Request, res: Response, next: NextFunction) {
    try {
      const budget = await financeService.createBudget(req.body);
      sendSuccess(res, 201, { budget }, 'Budget saved');
    } catch (error) {
      next(error);
    }
  },

  async deleteBudget(req: Request, res: Response, next: NextFunction) {
    try {
      await financeService.deleteBudget(parseInt(req.params.id as string, 10));
      sendSuccess(res, 200, null, 'Budget deleted');
    } catch (error) {
      next(error);
    }
  },

  async exportAudit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.exportAuditCsv(req.query);
      sendSuccess(res, 200, data, 'Audit pack ready');
    } catch (error) {
      next(error);
    }
  },

  async generateUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await financeService.generateUtilizationPdf(req.body || req.query);
      sendSuccess(res, 201, data, 'Utilization certificate generated');
    } catch (error) {
      next(error);
    }
  },
};
