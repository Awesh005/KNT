"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = void 0;
const campaign_service_1 = require("./campaign.service");
const response_1 = require("../../utils/response");
exports.campaignController = {
    async createCampaign(req, res, next) {
        try {
            const userId = req.user.id;
            const campaign = await campaign_service_1.campaignService.createCampaign(req.body, userId);
            (0, response_1.sendSuccess)(res, 201, { campaign }, 'Campaign created successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getCampaigns(req, res, next) {
        try {
            const data = await campaign_service_1.campaignService.getCampaigns(req.query);
            (0, response_1.sendSuccess)(res, 200, data, 'Campaigns fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getCampaignById(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const campaign = await campaign_service_1.campaignService.getCampaignById(id);
            (0, response_1.sendSuccess)(res, 200, { campaign }, 'Campaign fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getCampaignDonations(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const donations = await campaign_service_1.campaignService.getCampaignDonations(id);
            (0, response_1.sendSuccess)(res, 200, { donations }, 'Campaign donations fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateCampaign(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const campaign = await campaign_service_1.campaignService.updateCampaign(id, req.body);
            (0, response_1.sendSuccess)(res, 200, { campaign }, 'Campaign updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteCampaign(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const result = await campaign_service_1.campaignService.deleteCampaign(id);
            (0, response_1.sendSuccess)(res, 200, result, 'Campaign deleted successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getCampaignPayouts(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const payouts = await campaign_service_1.campaignService.getCampaignPayouts(id);
            (0, response_1.sendSuccess)(res, 200, { payouts }, 'Campaign payouts fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async addCampaignPayout(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const payout = await campaign_service_1.campaignService.addCampaignPayout(id, req.body);
            (0, response_1.sendSuccess)(res, 201, { payout }, 'Campaign payout added successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async removeCampaignPayout(req, res, next) {
        try {
            const payoutId = parseInt(req.params.payoutId);
            await campaign_service_1.campaignService.removeCampaignPayout(payoutId);
            (0, response_1.sendSuccess)(res, 200, { success: true }, 'Campaign payout removed successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
