import { internApplicationModel } from './intern-application.model';
import { NotFoundError, ValidationError } from '../../utils/errors';

const STATUSES = ['new', 'reviewing', 'shortlisted', 'selected', 'rejected'];

export const internApplicationService = {
  async create(data: any) {
    if (!data.name || !data.email || !data.phone || !data.college || !data.course || !data.internship_title) {
      throw new ValidationError('Name, email, phone, college, course, and internship are required');
    }
    const id = await internApplicationModel.create({
      ...data,
      internship_id: data.internship_id || `walk-in-${Date.now()}`,
    });
    return internApplicationModel.getById(id);
  },

  list(status?: string) {
    return internApplicationModel.list(status);
  },

  async getById(id: number) {
    const row = await internApplicationModel.getById(id);
    if (!row) throw new NotFoundError('Internship application not found');
    return row;
  },

  async updateStatus(id: number, status: string) {
    if (!STATUSES.includes(status)) {
      throw new ValidationError('Invalid application status');
    }
    await this.getById(id);
    await internApplicationModel.updateStatus(id, status);
    return internApplicationModel.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    await internApplicationModel.remove(id);
  },
};
