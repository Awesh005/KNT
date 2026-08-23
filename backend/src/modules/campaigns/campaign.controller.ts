import { Request, Response, NextFunction } from 'express';
import { campaignService } from './campaign.service';
import { sendSuccess } from '../../utils/response';

export const campaignController = {
  async createCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const campaign = await campaignService.createCampaign(req.body, userId);
      sendSuccess(res, 201, { campaign }, 'Campaign created successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCampaigns(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await campaignService.getCampaigns(req.query);
      sendSuccess(res, 200, data, 'Campaigns fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCampaignById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const campaign = await campaignService.getCampaignById(id);
      sendSuccess(res, 200, { campaign }, 'Campaign fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCampaignDonations(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const donations = await campaignService.getCampaignDonations(id);
      sendSuccess(res, 200, { donations }, 'Campaign donations fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const campaign = await campaignService.updateCampaign(id, req.body);
      sendSuccess(res, 200, { campaign }, 'Campaign updated successfully');
    } catch (error) {
      next(error);
    }
  },

  async deleteCampaign(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const result = await campaignService.deleteCampaign(id);
      sendSuccess(res, 200, result, 'Campaign deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async getCampaignPayouts(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const payouts = await campaignService.getCampaignPayouts(id);
      sendSuccess(res, 200, { payouts }, 'Campaign payouts fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async addCampaignPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const payout = await campaignService.addCampaignPayout(id, req.body);
      sendSuccess(res, 201, { payout }, 'Campaign payout added successfully');
    } catch (error) {
      next(error);
    }
  },

  async removeCampaignPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const payoutId = parseInt(req.params.payoutId as string);
      await campaignService.removeCampaignPayout(payoutId);
      sendSuccess(res, 200, { success: true }, 'Campaign payout removed successfully');
    } catch (error) {
      next(error);
    }
  }
};
