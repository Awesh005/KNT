import { enquiryModel } from './enquiry.model';
import { NotFoundError } from '../../utils/errors';

export const enquiryService = {
  async createEnquiry(data: any) {
    const insertId = await enquiryModel.createEnquiry(data);
    return await this.getEnquiryById(insertId);
  },

  async getEnquiries(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: any = { limit, offset };
    if (query.status) filters.status = query.status;

    const { enquiries, total } = await enquiryModel.getEnquiries(filters);

    return {
      enquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getEnquiryById(id: number) {
    const enquiry = await enquiryModel.getEnquiryById(id);
    if (!enquiry) throw new NotFoundError('Enquiry not found');
    return enquiry;
  },

  async updateEnquiryStatus(id: number, status: string) {
    await this.getEnquiryById(id); // Ensure it exists
    await enquiryModel.updateEnquiryStatus(id, status);
    return await this.getEnquiryById(id);
  },

  async deleteEnquiry(id: number) {
    await this.getEnquiryById(id); // Ensure it exists
    await enquiryModel.deleteEnquiry(id);
    return true;
  }
};
