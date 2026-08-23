"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestService = void 0;
const request_model_1 = require("./request.model");
const errors_1 = require("../../utils/errors");
const campaign_model_1 = require("../campaigns/campaign.model");
const crypto_1 = require("crypto");
exports.requestService = {
    async createRequest(data, userId) {
        const requestId = 'REQ-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        await request_model_1.requestModel.createRequest(requestId, userId, data);
        return await this.getRequestById(requestId);
    },
    async getRequests(query, userId) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;
        const filters = { limit, offset };
        if (query.status)
            filters.status = query.status;
        if (userId)
            filters.user_id = userId;
        const { requests, total } = await request_model_1.requestModel.getRequests(filters);
        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    async getRequestById(id, userId, userRole) {
        const request = await request_model_1.requestModel.getRequestById(id);
        if (!request)
            throw new errors_1.NotFoundError('Fundraiser request not found');
        if (userId && userRole && !['Admin', 'Super Admin'].includes(userRole) && request.user_id !== userId) {
            throw new errors_1.ForbiddenError('You are not authorized to view this request');
        }
        return request;
    },
    async updateRequestStatus(id, status, adminRemarks) {
        // Check existence
        const request = await this.getRequestById(id);
        await request_model_1.requestModel.updateRequestStatus(id, status, adminRemarks);
        // If approved, create a campaign
        if (status === 'approved') {
            let coverImage = ['https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop'];
            try {
                if (request.cover_images) {
                    const imgs = typeof request.cover_images === 'string' ? JSON.parse(request.cover_images) : request.cover_images;
                    if (Array.isArray(imgs) && imgs.length > 0) {
                        coverImage = imgs;
                    }
                }
            }
            catch (e) {
                console.error('Failed to parse cover_images:', e);
            }
            await campaign_model_1.campaignModel.createCampaign({
                title: request.beneficiary_name, // Using beneficiary name as title
                category: request.category,
                story: request.story,
                cover_image: coverImage,
                documents: request.documents,
                target_amount: request.target_amount,
                deadline: request.deadline,
                created_by: request.user_id,
                status: 'approved',
                account_holder_name: request.account_holder_name,
                account_number: request.account_number
            });
        }
        return await this.getRequestById(id);
    }
};
