"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactController = void 0;
const impact_service_1 = require("./impact.service");
const impact_model_1 = require("./impact.model");
const response_1 = require("../../utils/response");
exports.impactController = {
    async getProject(req, res, next) {
        try {
            const publicOnly = !['Admin', 'Super Admin'].includes(req.user?.role);
            const project = await impact_service_1.impactService.getProject(parseInt(req.params.id, 10), publicOnly);
            (0, response_1.sendSuccess)(res, 200, project, 'Project fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async addBeneficiary(req, res, next) {
        try {
            const id = await impact_service_1.impactService.addBeneficiary(parseInt(req.params.id, 10), req.body);
            (0, response_1.sendSuccess)(res, 201, { id }, 'Beneficiary added');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteBeneficiary(req, res, next) {
        try {
            await impact_model_1.impactModel.deleteBeneficiary(parseInt(req.params.beneficiaryId, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Beneficiary removed');
        }
        catch (error) {
            next(error);
        }
    },
    async addUpdate(req, res, next) {
        try {
            const id = await impact_service_1.impactService.addUpdate(parseInt(req.params.id, 10), req.body);
            (0, response_1.sendSuccess)(res, 201, { id }, 'Update posted');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteUpdate(req, res, next) {
        try {
            await impact_model_1.impactModel.deleteUpdate(parseInt(req.params.updateId, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Update removed');
        }
        catch (error) {
            next(error);
        }
    },
    async listUpdates(req, res, next) {
        try {
            const updates = await impact_model_1.impactModel.listUpdates(parseInt(req.params.id, 10), true);
            (0, response_1.sendSuccess)(res, 200, { updates }, 'Updates fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async beneficiaries(req, res, next) {
        try {
            const beneficiaries = await impact_service_1.impactService.listAllBeneficiaries();
            (0, response_1.sendSuccess)(res, 200, { beneficiaries }, 'Beneficiaries fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async sdg(req, res, next) {
        try {
            const sdg = await impact_service_1.impactService.sdg();
            (0, response_1.sendSuccess)(res, 200, { sdg }, 'SDG dashboard fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async csr(req, res, next) {
        try {
            const csr = await impact_service_1.impactService.csr();
            (0, response_1.sendSuccess)(res, 200, { csr }, 'CSR view fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async overview(req, res, next) {
        try {
            const overview = await impact_service_1.impactService.overview();
            (0, response_1.sendSuccess)(res, 200, overview, 'Insights overview fetched');
        }
        catch (error) {
            next(error);
        }
    },
};
