import { jobApplicationModel } from './job-application.model';
import { NotFoundError } from '../../utils/errors';

export const jobApplicationService = {
  async createApplication(data: any) {
    const id = await jobApplicationModel.createApplication(data);
    return jobApplicationModel.getApplicationById(id);
  },

  async getApplications(query: any) {
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.page ? (parseInt(query.page, 10) - 1) * limit : 0;
    return jobApplicationModel.getApplications({
      status: query.status,
      limit,
      offset,
    });
  },

  async getApplicationById(id: number) {
    const application = await jobApplicationModel.getApplicationById(id);
    if (!application) throw new NotFoundError('Application not found');
    return application;
  },

  async updateApplicationStatus(id: number, status: string) {
    const application = await this.getApplicationById(id);
    await jobApplicationModel.updateApplicationStatus(id, status);
    return { ...application, status };
  },

  async deleteApplication(id: number) {
    await this.getApplicationById(id);
    await jobApplicationModel.deleteApplication(id);
  },
};
