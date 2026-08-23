"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsService = void 0;
const cms_model_1 = require("./cms.model");
exports.cmsService = {
    async getContent(pageKey, sectionKey) {
        const data = await cms_model_1.cmsModel.getContent(pageKey, sectionKey);
        if (!data) {
            return { content: {} }; // Return empty object if not set yet instead of 404
        }
        return data;
    },
    async updateContent(pageKey, sectionKey, content, updatedBy) {
        await cms_model_1.cmsModel.upsertContent(pageKey, sectionKey, content, updatedBy);
        return await this.getContent(pageKey, sectionKey);
    }
};
