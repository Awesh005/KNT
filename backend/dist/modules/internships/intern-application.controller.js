"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internApplicationController = void 0;
const intern_application_service_1 = require("./intern-application.service");
const response_1 = require("../../utils/response");
exports.internApplicationController = {
    async create(req, res, next) {
        try {
            const file = req.file;
            const application = await intern_application_service_1.internApplicationService.create({
                ...req.body,
                resume_url: file ? `/uploads/applications/${file.filename}` : null,
            });
            (0, response_1.sendSuccess)(res, 201, { application }, 'Internship application submitted');
        }
        catch (error) {
            next(error);
        }
    },
    async list(req, res, next) {
        try {
            const applications = await intern_application_service_1.internApplicationService.list(req.query.status);
            (0, response_1.sendSuccess)(res, 200, { applications }, 'Internship applications fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const application = await intern_application_service_1.internApplicationService.updateStatus(parseInt(req.params.id, 10), req.body.status);
            (0, response_1.sendSuccess)(res, 200, { application }, 'Status updated');
        }
        catch (error) {
            next(error);
        }
    },
    async remove(req, res, next) {
        try {
            await intern_application_service_1.internApplicationService.remove(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Application deleted');
        }
        catch (error) {
            next(error);
        }
    },
};
