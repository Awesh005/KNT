"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cms_service_1 = require("./cms.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
exports.cmsController = {
    async getContent(req, res, next) {
        try {
            const pageKey = req.params.pageKey;
            const sectionKey = req.params.sectionKey;
            const data = await cms_service_1.cmsService.getContent(pageKey, sectionKey);
            (0, response_1.sendSuccess)(res, 200, data, 'CMS content fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateContent(req, res, next) {
        try {
            const pageKey = req.params.pageKey;
            const sectionKey = req.params.sectionKey;
            const userId = req.user.id;
            const result = await cms_service_1.cmsService.updateContent(pageKey, sectionKey, req.body.content, userId);
            (0, response_1.sendSuccess)(res, 200, result, 'CMS content updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadCertificate(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            const fileUrl = `/uploads/certificates/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 200, { url: fileUrl }, 'Certificate uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteCertificateFile(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl || typeof fileUrl !== 'string') {
                throw new Error('File URL is required');
            }
            // Security check: only allow deleting files in /uploads/certificates/ and prevent traversal
            if (!fileUrl.startsWith('/uploads/certificates/') || fileUrl.includes('..')) {
                throw new Error('Invalid file path');
            }
            // Construct absolute file path
            const filePath = path_1.default.join(process.cwd(), fileUrl);
            // Check if file exists and delete it
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'File deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadTeamMember(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            const fileUrl = `/uploads/team/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 200, { url: fileUrl }, 'Team member photo uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteTeamMemberFile(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl || typeof fileUrl !== 'string') {
                throw new Error('File URL is required');
            }
            if (!fileUrl.startsWith('/uploads/team/') || fileUrl.includes('..')) {
                throw new Error('Invalid file path');
            }
            const filePath = path_1.default.join(process.cwd(), fileUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Team member photo deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadCampaignImage(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
            const fileUrl = `/uploads/campaigns/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 200, { url: fileUrl }, 'Campaign image uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteCampaignImage(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl || typeof fileUrl !== 'string') {
                throw new Error('File URL is required');
            }
            if (!fileUrl.startsWith('/uploads/campaigns/') || fileUrl.includes('..')) {
                throw new Error('Invalid file path');
            }
            const filePath = path_1.default.join(process.cwd(), fileUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Campaign image deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadCampaignVideo(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No video file uploaded');
            }
            const fileUrl = `/uploads/campaigns/videos/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 200, { url: fileUrl }, 'Campaign video uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteCampaignVideo(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl || typeof fileUrl !== 'string') {
                throw new Error('File URL is required');
            }
            if (!fileUrl.startsWith('/uploads/campaigns/videos/') || fileUrl.includes('..')) {
                throw new Error('Invalid file path');
            }
            const filePath = path_1.default.join(process.cwd(), fileUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Campaign video deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadProgramImage(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No image file provided');
            }
            const fileUrl = `/uploads/programs/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 201, { fileUrl }, 'Program image uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteProgramImage(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl) {
                throw new errors_1.ValidationError('File URL is required');
            }
            const filename = fileUrl.split('/').pop();
            if (!filename) {
                throw new errors_1.ValidationError('Invalid file URL');
            }
            const filePath = path_1.default.join(process.cwd(), 'uploads', 'programs', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Program image deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadFeaturedImage(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No image file provided');
            }
            const fileUrl = `/uploads/featured_moments/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 201, { fileUrl }, 'Featured moment image uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteFeaturedImage(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl) {
                throw new errors_1.ValidationError('File URL is required');
            }
            const filename = fileUrl.split('/').pop();
            if (!filename) {
                throw new errors_1.ValidationError('Invalid file URL');
            }
            const filePath = path_1.default.join(process.cwd(), 'uploads', 'featured_moments', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Featured moment image deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadGalleryImage(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No image file provided');
            }
            const fileUrl = `/uploads/gallery/images/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 201, { fileUrl }, 'Gallery image uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteGalleryImage(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl) {
                throw new errors_1.ValidationError('File URL is required');
            }
            const filename = fileUrl.split('/').pop();
            if (!filename) {
                throw new errors_1.ValidationError('Invalid file URL');
            }
            const filePath = path_1.default.join(process.cwd(), 'uploads', 'gallery', 'images', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Gallery image deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadGalleryVideo(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No video file provided');
            }
            const fileUrl = `/uploads/gallery/videos/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 201, { fileUrl }, 'Gallery video uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteGalleryVideo(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl) {
                throw new errors_1.ValidationError('File URL is required');
            }
            const filename = fileUrl.split('/').pop();
            if (!filename) {
                throw new errors_1.ValidationError('Invalid file URL');
            }
            const filePath = path_1.default.join(process.cwd(), 'uploads', 'gallery', 'videos', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Gallery video deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async uploadPolicyDocument(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.ValidationError('No document file provided');
            }
            const fileUrl = `/uploads/policies/${req.file.filename}`;
            (0, response_1.sendSuccess)(res, 201, { fileUrl }, 'Policy document uploaded successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deletePolicyDocument(req, res, next) {
        try {
            const { fileUrl } = req.body;
            if (!fileUrl || typeof fileUrl !== 'string') {
                throw new errors_1.ValidationError('File URL is required');
            }
            if (!fileUrl.startsWith('/uploads/policies/') || fileUrl.includes('..')) {
                throw new errors_1.ValidationError('Invalid file path');
            }
            const filePath = path_1.default.join(process.cwd(), fileUrl);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Policy document deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
