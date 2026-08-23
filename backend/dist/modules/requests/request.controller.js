"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestController = void 0;
const request_service_1 = require("./request.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
exports.requestController = {
    async createRequest(req, res, next) {
        try {
            const userId = req.user.id;
            const requestRecord = await request_service_1.requestService.createRequest(req.body, userId);
            (0, response_1.sendSuccess)(res, 201, { request: requestRecord }, 'Fundraiser request submitted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadDocument(req, res, next) {
        try {
            if (!req.file)
                throw new errors_1.AppError('No file uploaded', 400);
            const fileUrl = `/uploads/requests/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 200, { fileUrl }, 'File uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getRequests(req, res, next) {
        try {
            const data = await request_service_1.requestService.getRequests(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Requests fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getMyRequests(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await request_service_1.requestService.getRequests(req.query, userId);
            (0, response_1.sendSuccess)(res, 200, data, 'Your requests fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getRequestById(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const requestRecord = await request_service_1.requestService.getRequestById(req.params.id, userId, userRole);
            (0, response_1.sendSuccess)(res, 200, { request: requestRecord }, 'Request fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const requestRecord = await request_service_1.requestService.updateRequestStatus(req.params.id, req.body.status, req.body.admin_remarks);
            (0, response_1.sendSuccess)(res, 200, { request: requestRecord }, 'Request status updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
