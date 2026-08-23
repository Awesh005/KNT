"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enquiryController = void 0;
const enquiry_service_1 = require("./enquiry.service");
const response_1 = require("../../utils/response");
const mail_service_1 = require("../../services/mail.service");
exports.enquiryController = {
    async createEnquiry(req, res, next) {
        try {
            const enquiry = await enquiry_service_1.enquiryService.createEnquiry(req.body);
            void mail_service_1.mailService.sendEnquiryAlert(enquiry);
            (0, response_1.sendSuccess)(res, 201, { enquiry }, 'Enquiry submitted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getEnquiries(req, res, next) {
        try {
            const data = await enquiry_service_1.enquiryService.getEnquiries(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Enquiries fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getEnquiryById(req, res, next) {
        try {
            const enquiry = await enquiry_service_1.enquiryService.getEnquiryById(parseInt(req.params.id));
            (0, response_1.sendSuccess)(res, 200, { enquiry }, 'Enquiry fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const enquiry = await enquiry_service_1.enquiryService.updateEnquiryStatus(parseInt(req.params.id), req.body.status);
            (0, response_1.sendSuccess)(res, 200, { enquiry }, 'Enquiry status updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteEnquiry(req, res, next) {
        try {
            await enquiry_service_1.enquiryService.deleteEnquiry(parseInt(req.params.id));
            (0, response_1.sendSuccess)(res, 200, null, 'Enquiry deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
