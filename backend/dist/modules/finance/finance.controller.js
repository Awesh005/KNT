"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeController = void 0;
const finance_service_1 = require("./finance.service");
const response_1 = require("../../utils/response");
exports.financeController = {
    async getDashboard(req, res, next) {
        try {
            const data = await finance_service_1.financeService.getDashboard(req.query.fy);
            (0, response_1.sendSuccess)(res, 200, data, 'Finance dashboard fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async getRegister(req, res, next) {
        try {
            const donations = await finance_service_1.financeService.getRegister(req.query);
            (0, response_1.sendSuccess)(res, 200, { donations }, 'Donation register fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async exportRegister(req, res, next) {
        try {
            const csv = await finance_service_1.financeService.exportRegisterCsv(req.query);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="donation-register.csv"');
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    },
    async getHeads(req, res, next) {
        try {
            const heads = await finance_service_1.financeService.getHeads();
            (0, response_1.sendSuccess)(res, 200, { heads }, 'Heads fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async createHead(req, res, next) {
        try {
            const id = await finance_service_1.financeService.createHead(req.body);
            (0, response_1.sendSuccess)(res, 201, { id }, 'Head created');
        }
        catch (error) {
            next(error);
        }
    },
    async getExpenses(req, res, next) {
        try {
            const expenses = await finance_service_1.financeService.getExpenses(req.query);
            (0, response_1.sendSuccess)(res, 200, { expenses }, 'Expenses fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async createExpense(req, res, next) {
        try {
            const expense = await finance_service_1.financeService.createExpense(req.body, req.user?.id);
            (0, response_1.sendSuccess)(res, 201, { expense }, 'Expense recorded');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteExpense(req, res, next) {
        try {
            await finance_service_1.financeService.deleteExpense(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Expense deleted');
        }
        catch (error) {
            next(error);
        }
    },
    async getBudgets(req, res, next) {
        try {
            const budgets = await finance_service_1.financeService.getBudgets(req.query.fy);
            (0, response_1.sendSuccess)(res, 200, { budgets }, 'Budgets fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async createBudget(req, res, next) {
        try {
            const budget = await finance_service_1.financeService.createBudget(req.body);
            (0, response_1.sendSuccess)(res, 201, { budget }, 'Budget saved');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteBudget(req, res, next) {
        try {
            await finance_service_1.financeService.deleteBudget(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Budget deleted');
        }
        catch (error) {
            next(error);
        }
    },
    async exportAudit(req, res, next) {
        try {
            const data = await finance_service_1.financeService.exportAuditCsv(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Audit pack ready');
        }
        catch (error) {
            next(error);
        }
    },
    async generateUtilization(req, res, next) {
        try {
            const data = await finance_service_1.financeService.generateUtilizationPdf(req.body || req.query);
            (0, response_1.sendSuccess)(res, 201, data, 'Utilization certificate generated');
        }
        catch (error) {
            next(error);
        }
    },
};
