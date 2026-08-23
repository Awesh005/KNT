"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationService = void 0;
const job_application_model_1 = require("./job-application.model");
const errors_1 = require("../../utils/errors");
exports.jobApplicationService = {
    async createApplication(data) {
        const id = await job_application_model_1.jobApplicationModel.createApplication(data);
        return job_application_model_1.jobApplicationModel.getApplicationById(id);
    },
    async getApplications(query) {
        const limit = query.limit ? parseInt(query.limit, 10) : 50;
        const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
        return job_application_model_1.jobApplicationModel.getApplications({
            status: query.status,
            limit,
            offset,
        });
    },
    async getApplicationById(id) {
        const application = await job_application_model_1.jobApplicationModel.getApplicationById(id);
        if (!application)
            throw new errors_1.NotFoundError('Application not found');
        return application;
    },
    async updateApplicationStatus(id, status) {
        const application = await this.getApplicationById(id);
        await job_application_model_1.jobApplicationModel.updateApplicationStatus(id, status);
        return { ...application, status };
    },
    async deleteApplication(id) {
        await this.getApplicationById(id);
        await job_application_model_1.jobApplicationModel.deleteApplication(id);
    },
};
