"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../utils/response");
exports.adminController = {
    async getNotifications(req, res, next) {
        try {
            const data = await admin_service_1.adminService.getNotifications();
            (0, response_1.sendSuccess)(res, 200, data, 'Notifications fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
};
