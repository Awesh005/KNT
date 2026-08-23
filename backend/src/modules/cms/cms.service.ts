import { cmsModel } from './cms.model';
import { NotFoundError } from '../../utils/errors';

export const cmsService = {
  async getContent(pageKey: string, sectionKey: string) {
    const data = await cmsModel.getContent(pageKey, sectionKey);
    if (!data) {
      return { content: {} }; // Return empty object if not set yet instead of 404
    }
    return data;
  },

  async updateContent(pageKey: string, sectionKey: string, content: any, updatedBy: string) {
    await cmsModel.upsertContent(pageKey, sectionKey, content, updatedBy);
    return await this.getContent(pageKey, sectionKey);
  }
};
