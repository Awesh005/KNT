import { Router } from 'express';
import { financeController } from './finance.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createHeadSchema, createExpenseSchema, createBudgetSchema } from './finance.validation';

const router = Router();

router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.get('/dashboard', financeController.getDashboard);
router.get('/register', financeController.getRegister);
router.get('/register.csv', financeController.exportRegister);
router.get('/heads', financeController.getHeads);
router.post('/heads', validate(createHeadSchema), financeController.createHead);
router.get('/expenses', financeController.getExpenses);
router.post('/expenses', validate(createExpenseSchema), financeController.createExpense);
router.delete('/expenses/:id', financeController.deleteExpense);
router.get('/budgets', financeController.getBudgets);
router.post('/budgets', validate(createBudgetSchema), financeController.createBudget);
router.delete('/budgets/:id', financeController.deleteBudget);
router.get('/audit', financeController.exportAudit);
router.post('/utilization', financeController.generateUtilization);

export default router;
