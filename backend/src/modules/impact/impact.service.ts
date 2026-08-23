import { impactModel } from './impact.model';
import { campaignModel } from '../campaigns/campaign.model';
import { saveDataUrl } from '../people/people.util';
import { NotFoundError, ValidationError } from '../../utils/errors';

export const impactService = {
  async getProject(campaignId: number, publicOnly = false) {
    const campaign = await campaignModel.getCampaignById(campaignId);
    if (!campaign) throw new NotFoundError('Campaign not found');
    const [beneficiaries, updates, money] = await Promise.all([
      impactModel.listBeneficiaries({ campaign_id: campaignId }),
      impactModel.listUpdates(campaignId, publicOnly),
      impactModel.campaignMoney(campaignId),
    ]);
    const photos = [
      ...(Array.isArray(campaign.cover_image) ? campaign.cover_image : campaign.cover_image ? [campaign.cover_image] : []),
      ...updates.flatMap((row: any) => row.photo_urls || []),
      ...(publicOnly ? [] : beneficiaries.map((row: any) => row.photo_url).filter(Boolean)),
    ];
    return {
      campaign,
      money: {
        ...money,
        target: Number(campaign.target_amount) || 0,
      },
      beneficiaries: publicOnly
        ? beneficiaries.map((row: any) => ({ kind: row.kind, city: row.city, status: row.status }))
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

  addBeneficiary(campaignId: number, body: any) {
    if (!body.name) throw new ValidationError('Name is required');
    const photo_url = saveDataUrl(body.photo_base64, 'impact', `ben-${campaignId}`) || body.photo_url || null;
    return impactModel.createBeneficiary({
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

  async addUpdate(campaignId: number, body: any) {
    if (!body.title) throw new ValidationError('Title is required');
    const photos = Array.isArray(body.photo_base64)
      ? body.photo_base64.map((item: string, i: number) => saveDataUrl(item, 'impact', `upd-${campaignId}-${i}`)).filter(Boolean)
      : [];
    if (body.photo_base64 && !Array.isArray(body.photo_base64)) {
      const one = saveDataUrl(body.photo_base64, 'impact', `upd-${campaignId}`);
      if (one) photos.push(one);
    }
    return impactModel.createUpdate({
      campaign_id: campaignId,
      title: body.title,
      body: body.body,
      photo_urls: photos,
      is_public: body.is_public !== false,
    });
  },

  listAllBeneficiaries() {
    return impactModel.listBeneficiaries({});
  },

  sdg() {
    return impactModel.sdgRollup();
  },

  csr() {
    return impactModel.csrRollup();
  },
};
