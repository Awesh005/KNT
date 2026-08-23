import { campaignModel } from './campaign.model';
import { donationModel } from '../donations/donation.model';
import { payoutModel } from './payout.model';
import { NotFoundError } from '../../utils/errors';

export const campaignService = {
  async createCampaign(data: any, userId: string) {
    const insertId = await campaignModel.createCampaign({ ...data, created_by: userId });
    return await this.getCampaignById(insertId);
  },

  async getCampaigns(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: any = { limit, offset };

    if (query.is_urgent === 'true') filters.is_urgent = true;
    if (query.is_featured === 'true') filters.is_featured = true;
    if (query.status) filters.status = query.status;
    if (query.category) filters.category = query.category;

    const { campaigns, total } = await campaignModel.getCampaigns(filters);

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

  async getCampaignById(id: number) {
    const campaign = await campaignModel.getCampaignById(id);
    if (!campaign) throw new NotFoundError('Campaign not found');
    return campaign;
  },

  async getCampaignDonations(id: number) {
    // Ensure campaign exists
    await this.getCampaignById(id);
    const { donations } = await donationModel.getDonations({ campaign_id: id, status: 'verified', limit: 100 });
    return donations.map((d: any) => ({
      id: d.id,
      donorName: d.donor_name || 'Anonymous',
      amount: Number(d.amount),
      donatedAt: d.created_at
    }));
  },

  async updateCampaign(id: number, data: any) {
    // Ensure campaign exists
    await this.getCampaignById(id);
    
    await campaignModel.updateCampaign(id, data);
    return await this.getCampaignById(id);
  },

  async deleteCampaign(id: number) {
    await this.getCampaignById(id);
    await campaignModel.deleteCampaign(id);
    return { success: true };
  },

  async getCampaignPayouts(id: number) {
    await this.getCampaignById(id);
    return await payoutModel.getPayoutsByCampaign(id);
  },

  async addCampaignPayout(id: number, data: any) {
    await this.getCampaignById(id);
    data.campaign_id = id;
    const payoutId = await payoutModel.createPayout(data);
    return { id: payoutId, ...data };
  },

  async removeCampaignPayout(payoutId: number) {
    await payoutModel.deletePayout(payoutId);
    return { success: true };
  }
};
