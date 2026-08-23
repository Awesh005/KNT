import { requestModel } from './request.model';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { campaignModel } from '../campaigns/campaign.model';
import { randomUUID as uuidv4 } from 'crypto';

export const requestService = {
  async createRequest(data: any, userId: string) {
    const requestId = 'REQ-' + uuidv4().split('-')[0].toUpperCase();
    await requestModel.createRequest(requestId, userId, data);
    return await this.getRequestById(requestId);
  },

  async getRequests(query: any, userId?: string) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: any = { limit, offset };
    if (query.status) filters.status = query.status;
    if (userId) filters.user_id = userId;

    const { requests, total } = await requestModel.getRequests(filters);

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

  async getRequestById(id: string, userId?: string, userRole?: string) {
    const request = await requestModel.getRequestById(id);
    if (!request) throw new NotFoundError('Fundraiser request not found');

    if (userId && userRole && !['Admin', 'Super Admin'].includes(userRole) && request.user_id !== userId) {
      throw new ForbiddenError('You are not authorized to view this request');
    }

    return request;
  },

  async updateRequestStatus(id: string, status: string, adminRemarks?: string) {
    // Check existence
    const request = await this.getRequestById(id);

    await requestModel.updateRequestStatus(id, status, adminRemarks);
    
    // If approved, create a campaign
    if (status === 'approved') {
      let coverImage: string[] = ['https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop'];
      try {
        if (request.cover_images) {
          const imgs = typeof request.cover_images === 'string' ? JSON.parse(request.cover_images) : request.cover_images;
          if (Array.isArray(imgs) && imgs.length > 0) {
            coverImage = imgs;
          }
        }
      } catch (e) {
        console.error('Failed to parse cover_images:', e);
      }

      await campaignModel.createCampaign({
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
