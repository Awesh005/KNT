"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commsController = void 0;
const comms_model_1 = require("./comms.model");
const response_1 = require("../../utils/response");
exports.commsController = {
    async templates(_req, res, next) {
        try {
            const templates = await comms_model_1.commsModel.listTemplates();
            (0, response_1.sendSuccess)(res, 200, { templates }, 'Mail templates fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async updateTemplate(req, res, next) {
        try {
            const template = await comms_model_1.commsModel.updateTemplate(req.params.key, req.body);
            (0, response_1.sendSuccess)(res, 200, { template }, 'Template saved');
        }
        catch (error) {
            next(error);
        }
    },
    async log(_req, res, next) {
        try {
            const log = await comms_model_1.commsModel.listLog();
            (0, response_1.sendSuccess)(res, 200, { log }, 'Mail log fetched');
        }
        catch (error) {
            next(error);
        }
    },
};
