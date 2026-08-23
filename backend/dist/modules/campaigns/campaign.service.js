"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = void 0;
const campaign_model_1 = require("./campaign.model");
const donation_model_1 = require("../donations/donation.model");
const payout_model_1 = require("./payout.model");
const errors_1 = require("../../utils/errors");
exports.campaignService = {
    async createCampaign(data, userId) {
        const insertId = await campaign_model_1.campaignModel.createCampaign({ ...data, created_by: userId });
        return await this.getCampaignById(insertId);
    },
    async getCampaigns(query) {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;
        const filters = { limit, offset };
        if (query.is_urgent === 'true')
            filters.is_urgent = true;
        if (query.is_featured === 'true')
            filters.is_featured = true;
        if (query.status)
            filters.status = query.status;
        if (query.category)
            filters.category = query.category;
        const { campaigns, total } = await campaign_model_1.campaignModel.getCampaigns(filters);
        return {
            campaigns,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    async getCampaignById(id) {
        const campaign = await campaign_model_1.campaignModel.getCampaignById(id);
        if (!campaign)
            throw new errors_1.NotFoundError('Campaign not found');
        return campaign;
    },
    async getCampaignDonations(id) {
        // Ensure campaign exists
        await this.getCampaignById(id);
        const { donations } = await donation_model_1.donationModel.getDonations({ campaign_id: id, status: 'verified', limit: 100 });
        return donations.map((d) => ({
            id: d.id,
            donorName: d.donor_name || 'Anonymous',
            amount: Number(d.amount),
            donatedAt: d.created_at
        }));
    },
    async updateCampaign(id, data) {
        // Ensure campaign exists
        await this.getCampaignById(id);
        await campaign_model_1.campaignModel.updateCampaign(id, data);
        return await this.getCampaignById(id);
    },
    async deleteCampaign(id) {
        await this.getCampaignById(id);
        await campaign_model_1.campaignModel.deleteCampaign(id);
        return { success: true };
    },
    async getCampaignPayouts(id) {
        await this.getCampaignById(id);
        return await payout_model_1.payoutModel.getPayoutsByCampaign(id);
    },
    async addCampaignPayout(id, data) {
        await this.getCampaignById(id);
        data.campaign_id = id;
        const payoutId = await payout_model_1.payoutModel.createPayout(data);
        return { id: payoutId, ...data };
    },
    async removeCampaignPayout(payoutId) {
        await payout_model_1.payoutModel.deletePayout(payoutId);
        return { success: true };
    }
};
