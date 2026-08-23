"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const payment_service_1 = require("./payment.service");
const response_1 = require("../../utils/response");
const logger_1 = require("../../config/logger");
exports.paymentController = {
    config(_req, res) {
        (0, response_1.sendSuccess)(res, 200, payment_service_1.paymentService.config(), 'Payment config');
    },
    async createOrder(req, res, next) {
        try {
            const userId = req.user?.id || null;
            const order = await payment_service_1.paymentService.createOrder(req.body, userId);
            (0, response_1.sendSuccess)(res, 201, order, 'SBI checkout created');
        }
        catch (error) {
            next(error);
        }
    },
    async sbiReturn(req, res, next) {
        try {
            const enc = (req.body?.encData || req.body?.EncryptTrans || req.query.encData || '');
            const redirectTo = await payment_service_1.paymentService.handleSbiReturn(enc);
            res.redirect(302, redirectTo);
        }
        catch (error) {
            logger_1.logger.error('SBI return handling failed', error?.message || error);
            next(error);
        }
    },
    async sbiWebhook(req, res, next) {
        try {
            const enc = (req.body?.encData || req.body?.EncryptTrans || '');
            await payment_service_1.paymentService.handleSbiReturn(enc);
            res.status(200).send('OK');
        }
        catch (error) {
            next(error);
        }
    },
    async status(req, res, next) {
        try {
            const data = await payment_service_1.paymentService.getPublicStatus(req.params.id);
            (0, response_1.sendSuccess)(res, 200, data, 'Donation status');
        }
        catch (error) {
            next(error);
        }
    },
    async refund(req, res, next) {
        try {
            const result = await payment_service_1.paymentService.refund(req.params.id, req.body?.reason || 'Admin refund');
            (0, response_1.sendSuccess)(res, 200, result, 'Refund recorded');
        }
        catch (error) {
            next(error);
        }
    },
};
