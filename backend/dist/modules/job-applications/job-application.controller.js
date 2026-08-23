"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationController = void 0;
const job_application_service_1 = require("./job-application.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
const mail_service_1 = require("../../services/mail.service");
const REQUIRED_FILES = ['photo', 'aadhaar', 'education', 'resume', 'address'];
function collectUploadedFiles(req) {
    const fileMap = {};
    const files = req.files;
    if (!files)
        return fileMap;
    if (Array.isArray(files)) {
        files.forEach((file) => {
            fileMap[file.fieldname] = file;
        });
        return fileMap;
    }
    Object.entries(files).forEach(([field, list]) => {
        if (list?.[0])
            fileMap[field] = list[0];
    });
    return fileMap;
}
function documentsFromUploads(fileMap) {
    const documents = {};
    Object.entries(fileMap).forEach(([field, file]) => {
        documents[field] = `/uploads/applications/${file.filename}`;
    });
    return documents;
}
exports.jobApplicationController = {
    async createApplication(req, res, next) {
        try {
            const { job_id, job_title, name, email, phone, qualification, experience } = req.body;
            if (!job_id || !job_title || !name || !email || !phone || !qualification) {
                throw new errors_1.ValidationError('All required fields must be provided');
            }
            const fileMap = collectUploadedFiles(req);
            for (const field of REQUIRED_FILES) {
                if (!fileMap[field]) {
                    throw new errors_1.ValidationError(`Missing required document: ${field}`);
                }
            }
            const application = await job_application_service_1.jobApplicationService.createApplication({
                job_id,
                job_title,
                name,
                email,
                phone,
                qualification,
                experience,
                documents: documentsFromUploads(fileMap),
            });
            void mail_service_1.mailService.sendJobApplicationAlert(application);
            (0, response_1.sendSuccess)(res, 201, { application }, 'Application submitted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async createAdminApplication(req, res, next) {
        try {
            const { job_id, job_title, name, email, phone, qualification, experience } = req.body;
            if (!name || !email || !phone || !job_title) {
                throw new errors_1.ValidationError('Name, email, phone, and job title are required');
            }
            const application = await job_application_service_1.jobApplicationService.createApplication({
                job_id: job_id || `walk-in-${Date.now()}`,
                job_title,
                name,
                email,
                phone,
                qualification: qualification || 'Not specified',
                experience,
                documents: documentsFromUploads(collectUploadedFiles(req)),
            });
            (0, response_1.sendSuccess)(res, 201, { application }, 'Application added');
        }
        catch (error) {
            next(error);
        }
    },
    async getApplications(req, res, next) {
        try {
            const data = await job_application_service_1.jobApplicationService.getApplications(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Applications fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getApplicationById(req, res, next) {
        try {
            const application = await job_application_service_1.jobApplicationService.getApplicationById(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, { application }, 'Application fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const application = await job_application_service_1.jobApplicationService.updateApplicationStatus(parseInt(req.params.id, 10), req.body.status);
            (0, response_1.sendSuccess)(res, 200, { application }, 'Application status updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteApplication(req, res, next) {
        try {
            await job_application_service_1.jobApplicationService.deleteApplication(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, null, 'Application deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
};
