"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentController = void 0;
const document_service_1 = require("./document.service");
const response_1 = require("../../utils/response");
exports.documentController = {
    async generateReceipt(req, res, next) {
        try {
            const receipt = await document_service_1.documentService.generateReceipt(req.params.donationId);
            (0, response_1.sendSuccess)(res, 201, { receipt }, 'Receipt generated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async generate80GCertificate(req, res, next) {
        try {
            const regenerate = req.query.regenerate === 'true';
            const certificate = await document_service_1.documentService.generate80G(req.params.donationId, { regenerate });
            (0, response_1.sendSuccess)(res, 201, { certificate }, regenerate ? '80G Certificate regenerated successfully' : '80G Certificate generated successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
