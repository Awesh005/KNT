"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officeController = void 0;
const office_service_1 = require("./office.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
exports.officeController = {
    async listFiles(req, res, next) {
        try {
            const role = req.user?.role;
            const admin = ['Admin', 'Super Admin'].includes(role);
            const data = await office_service_1.officeService.listFiles(req.query, role, admin);
            (0, response_1.sendSuccess)(res, 200, data, 'Files fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadFile(req, res, next) {
        try {
            if (!req.file)
                throw new errors_1.ValidationError('File is required');
            const file = await office_service_1.officeService.registerUpload(req.file, req.body, req.user?.id);
            (0, response_1.sendSuccess)(res, 201, { file }, 'File registered');
        }
        catch (error) {
            next(error);
        }
    },
    async updateFile(req, res, next) {
        try {
            const file = await office_service_1.officeService.updateFile(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 200, { file }, 'File updated');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteFile(req, res, next) {
        try {
            await office_service_1.officeService.deleteFile(req.params.id);
            (0, response_1.sendSuccess)(res, 200, null, 'File deleted');
        }
        catch (error) {
            next(error);
        }
    },
    async listTemplates(req, res, next) {
        try {
            const templates = await office_service_1.officeService.listTemplates();
            (0, response_1.sendSuccess)(res, 200, { templates }, 'Templates fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async createTemplate(req, res, next) {
        try {
            const id = await office_service_1.officeService.createTemplate(req.body);
            (0, response_1.sendSuccess)(res, 201, { id }, 'Template saved');
        }
        catch (error) {
            next(error);
        }
    },
    async dispatchLetter(req, res, next) {
        try {
            const letter = await office_service_1.officeService.dispatchLetter(req.body, req.user?.id);
            (0, response_1.sendSuccess)(res, 201, { letter }, 'Letter dispatched');
        }
        catch (error) {
            next(error);
        }
    },
    async listLetters(req, res, next) {
        try {
            const letters = await office_service_1.officeService.listLetters(req.query.search);
            (0, response_1.sendSuccess)(res, 200, { letters }, 'Letters fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async sendLetter(req, res, next) {
        try {
            const result = await office_service_1.officeService.sendLetter(req.params.id, req.body.channel);
            (0, response_1.sendSuccess)(res, 200, result, 'Send logged');
        }
        catch (error) {
            next(error);
        }
    },
    async listSends(req, res, next) {
        try {
            const sends = await office_service_1.officeService.listSends(req.query.letter_id);
            (0, response_1.sendSuccess)(res, 200, { sends }, 'Send log fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async getSeal(req, res, next) {
        try {
            const data = await office_service_1.officeService.getSeal();
            (0, response_1.sendSuccess)(res, 200, data, 'Seal fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadSeal(req, res, next) {
        try {
            if (!req.file)
                throw new errors_1.ValidationError('Seal image is required');
            const data = await office_service_1.officeService.setSeal(req.file);
            (0, response_1.sendSuccess)(res, 200, data, 'Seal uploaded');
        }
        catch (error) {
            next(error);
        }
    },
    async verify(req, res, next) {
        try {
            const result = await office_service_1.officeService.verify(req.params.code);
            (0, response_1.sendSuccess)(res, 200, result, result.valid ? 'Valid' : 'Invalid');
        }
        catch (error) {
            next(error);
        }
    },
};
