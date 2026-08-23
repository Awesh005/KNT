"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactService = void 0;
const impact_model_1 = require("./impact.model");
const campaign_model_1 = require("../campaigns/campaign.model");
const people_util_1 = require("../people/people.util");
const errors_1 = require("../../utils/errors");
exports.impactService = {
    async getProject(campaignId, publicOnly = false) {
        const campaign = await campaign_model_1.campaignModel.getCampaignById(campaignId);
        if (!campaign)
            throw new errors_1.NotFoundError('Campaign not found');
        const [beneficiaries, updates, money] = await Promise.all([
            impact_model_1.impactModel.listBeneficiaries({ campaign_id: campaignId }),
            impact_model_1.impactModel.listUpdates(campaignId, publicOnly),
            impact_model_1.impactModel.campaignMoney(campaignId),
        ]);
        const photos = [
            ...(Array.isArray(campaign.cover_image) ? campaign.cover_image : campaign.cover_image ? [campaign.cover_image] : []),
            ...updates.flatMap((row) => row.photo_urls || []),
            ...(publicOnly ? [] : beneficiaries.map((row) => row.photo_url).filter(Boolean)),
        ];
        return {
            campaign,
            money: {
                ...money,
                target: Number(campaign.target_amount) || 0,
            },
            beneficiaries: publicOnly
                ? beneficiaries.map((row) => ({ kind: row.kind, city: row.city, status: row.status }))
                : beneficiaries,
            updates,
            photos,
        };
    },
    async overview() {
        const [sdg, csr, beneficiaries] = await Promise.all([
            this.sdg(),
            this.csr(),
            this.listAllBeneficiaries(),
        ]);
        return { sdg, csr, beneficiaries };
    },
    addBeneficiary(campaignId, body) {
        if (!body.name)
            throw new errors_1.ValidationError('Name is required');
        const photo_url = (0, people_util_1.saveDataUrl)(body.photo_base64, 'impact', `ben-${campaignId}`) || body.photo_url || null;
        return impact_model_1.impactModel.createBeneficiary({
            campaign_id: campaignId,
            kind: body.kind || 'other',
            name: body.name,
            age: body.age ? Number(body.age) : null,
            gender: body.gender,
            city: body.city,
            details: body.details || null,
            photo_url,
            program_key: body.program_key,
        });
    },
    async addUpdate(campaignId, body) {
        if (!body.title)
            throw new errors_1.ValidationError('Title is required');
        const photos = Array.isArray(body.photo_base64)
            ? body.photo_base64.map((item, i) => (0, people_util_1.saveDataUrl)(item, 'impact', `upd-${campaignId}-${i}`)).filter(Boolean)
            : [];
        if (body.photo_base64 && !Array.isArray(body.photo_base64)) {
            const one = (0, people_util_1.saveDataUrl)(body.photo_base64, 'impact', `upd-${campaignId}`);
            if (one)
                photos.push(one);
        }
        return impact_model_1.impactModel.createUpdate({
            campaign_id: campaignId,
            title: body.title,
            body: body.body,
            photo_urls: photos,
            is_public: body.is_public !== false,
        });
    },
    listAllBeneficiaries() {
        return impact_model_1.impactModel.listBeneficiaries({});
    },
    sdg() {
        return impact_model_1.impactModel.sdgRollup();
    },
    csr() {
        return impact_model_1.impactModel.csrRollup();
    },
};
