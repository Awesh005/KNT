"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enquiryService = void 0;
const enquiry_model_1 = require("./enquiry.model");
const errors_1 = require("../../utils/errors");
exports.enquiryService = {
    async createEnquiry(data) {
        const insertId = await enquiry_model_1.enquiryModel.createEnquiry(data);
        return await this.getEnquiryById(insertId);
    },
    async getEnquiries(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;
        const filters = { limit, offset };
        if (query.status)
            filters.status = query.status;
        const { enquiries, total } = await enquiry_model_1.enquiryModel.getEnquiries(filters);
        return {
            enquiries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    async getEnquiryById(id) {
        const enquiry = await enquiry_model_1.enquiryModel.getEnquiryById(id);
        if (!enquiry)
            throw new errors_1.NotFoundError('Enquiry not found');
        return enquiry;
    },
    async updateEnquiryStatus(id, status) {
        await this.getEnquiryById(id); // Ensure it exists
        await enquiry_model_1.enquiryModel.updateEnquiryStatus(id, status);
        return await this.getEnquiryById(id);
    },
    async deleteEnquiry(id) {
        await this.getEnquiryById(id); // Ensure it exists
        await enquiry_model_1.enquiryModel.deleteEnquiry(id);
        return true;
    }
};
