"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internApplicationService = void 0;
const intern_application_model_1 = require("./intern-application.model");
const errors_1 = require("../../utils/errors");
const STATUSES = ['new', 'reviewing', 'shortlisted', 'selected', 'rejected'];
exports.internApplicationService = {
    async create(data) {
        if (!data.name || !data.email || !data.phone || !data.college || !data.course || !data.internship_title) {
            throw new errors_1.ValidationError('Name, email, phone, college, course, and internship are required');
        }
        const id = await intern_application_model_1.internApplicationModel.create({
            ...data,
            internship_id: data.internship_id || `walk-in-${Date.now()}`,
        });
        return intern_application_model_1.internApplicationModel.getById(id);
    },
    list(status) {
        return intern_application_model_1.internApplicationModel.list(status);
    },
    async getById(id) {
        const row = await intern_application_model_1.internApplicationModel.getById(id);
        if (!row)
            throw new errors_1.NotFoundError('Internship application not found');
        return row;
    },
    async updateStatus(id, status) {
        if (!STATUSES.includes(status)) {
            throw new errors_1.ValidationError('Invalid application status');
        }
        await this.getById(id);
        await intern_application_model_1.internApplicationModel.updateStatus(id, status);
        return intern_application_model_1.internApplicationModel.getById(id);
    },
    async remove(id) {
        await this.getById(id);
        await intern_application_model_1.internApplicationModel.remove(id);
    },
};
