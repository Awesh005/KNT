"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleController = void 0;
const people_service_1 = require("./people.service");
const auth_model_1 = require("../auth/auth.model");
const response_1 = require("../../utils/response");
async function currentUser(req) {
    const tokenUser = req.user;
    if (!tokenUser?.id)
        return null;
    const row = await auth_model_1.authModel.findUserById(tokenUser.id);
    return row ? { id: row.id, email: row.email, name: row.name, role: row.role } : null;
}
exports.peopleController = {
    async applyMembership(req, res, next) {
        try {
            const membership = await people_service_1.peopleService.applyMembership(req.body, req.user);
            (0, response_1.sendSuccess)(res, 201, { membership }, 'Membership application received');
        }
        catch (error) {
            next(error);
        }
    },
    async listMemberships(req, res, next) {
        try {
            const memberships = await people_service_1.peopleService.listMemberships(req.query.status);
            (0, response_1.sendSuccess)(res, 200, { memberships }, 'Memberships fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async decideMembership(req, res, next) {
        try {
            const membership = await people_service_1.peopleService.decideMembership(req.params.id, req.body.status);
            (0, response_1.sendSuccess)(res, 200, { membership }, 'Membership updated');
        }
        catch (error) {
            next(error);
        }
    },
    async createMembershipAdmin(req, res, next) {
        try {
            const result = await people_service_1.peopleService.createMembershipByAdmin(req.body);
            (0, response_1.sendSuccess)(res, 201, result, 'Member created with portal login');
        }
        catch (error) {
            next(error);
        }
    },
    async setMembershipCredentials(req, res, next) {
        try {
            const result = await people_service_1.peopleService.setMembershipCredentials(req.params.id, req.body.password);
            (0, response_1.sendSuccess)(res, 200, result, 'Login password updated');
        }
        catch (error) {
            next(error);
        }
    },
    async reissueMembershipId(req, res, next) {
        try {
            const membership = await people_service_1.peopleService.reissueMembershipId(req.params.id);
            (0, response_1.sendSuccess)(res, 200, { membership }, 'ID card reissued');
        }
        catch (error) {
            next(error);
        }
    },
    async myMembership(req, res, next) {
        try {
            const user = await currentUser(req);
            const membership = await people_service_1.peopleService.myMembership(user);
            (0, response_1.sendSuccess)(res, 200, { membership }, 'Membership fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async renewMembership(req, res, next) {
        try {
            const user = await currentUser(req);
            const membership = await people_service_1.peopleService.renewMembership(user, req.body);
            (0, response_1.sendSuccess)(res, 200, { membership }, 'Renewal submitted');
        }
        catch (error) {
            next(error);
        }
    },
    async verify(req, res, next) {
        try {
            const record = await people_service_1.peopleService.verifyPerson(req.params.code);
            (0, response_1.sendSuccess)(res, 200, { record }, record ? 'Valid' : 'Not found');
        }
        catch (error) {
            next(error);
        }
    },
    async sendReminders(req, res, next) {
        try {
            const result = await people_service_1.peopleService.sendExpiryReminders();
            (0, response_1.sendSuccess)(res, 200, result, 'Reminders sent');
        }
        catch (error) {
            next(error);
        }
    },
    async applyVolunteer(req, res, next) {
        try {
            const volunteer = await people_service_1.peopleService.applyVolunteer(req.body, req.user);
            (0, response_1.sendSuccess)(res, 201, { volunteer }, 'Volunteer application received');
        }
        catch (error) {
            next(error);
        }
    },
    async listVolunteers(req, res, next) {
        try {
            const volunteers = await people_service_1.peopleService.listVolunteers(req.query.status);
            (0, response_1.sendSuccess)(res, 200, { volunteers }, 'Volunteers fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async decideVolunteer(req, res, next) {
        try {
            const volunteer = await people_service_1.peopleService.decideVolunteer(req.params.id, req.body.status);
            (0, response_1.sendSuccess)(res, 200, { volunteer }, 'Volunteer updated');
        }
        catch (error) {
            next(error);
        }
    },
    async createVolunteerAdmin(req, res, next) {
        try {
            const result = await people_service_1.peopleService.createVolunteerByAdmin(req.body);
            (0, response_1.sendSuccess)(res, 201, result, 'Volunteer created with portal login');
        }
        catch (error) {
            next(error);
        }
    },
    async setVolunteerCredentials(req, res, next) {
        try {
            const result = await people_service_1.peopleService.setVolunteerCredentials(req.params.id, req.body.password);
            (0, response_1.sendSuccess)(res, 200, result, 'Login password updated');
        }
        catch (error) {
            next(error);
        }
    },
    async myVolunteer(req, res, next) {
        try {
            const user = await currentUser(req);
            const volunteer = await people_service_1.peopleService.myVolunteer(user);
            (0, response_1.sendSuccess)(res, 200, { volunteer }, 'Volunteer profile fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async logHours(req, res, next) {
        try {
            const user = await currentUser(req);
            const volunteer = await people_service_1.peopleService.logHours(user, req.body);
            (0, response_1.sendSuccess)(res, 201, { volunteer }, 'Hours logged');
        }
        catch (error) {
            next(error);
        }
    },
    async addAssignment(req, res, next) {
        try {
            const volunteer = await people_service_1.peopleService.addAssignment(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 201, { volunteer }, 'Assignment added');
        }
        catch (error) {
            next(error);
        }
    },
    async listEmployees(req, res, next) {
        try {
            const employees = await people_service_1.peopleService.listEmployees();
            (0, response_1.sendSuccess)(res, 200, { employees }, 'Employees fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async hire(req, res, next) {
        try {
            const employee = await people_service_1.peopleService.hireFromApplication(req.body);
            (0, response_1.sendSuccess)(res, 201, { employee }, 'Applicant hired');
        }
        catch (error) {
            next(error);
        }
    },
    async createEmployee(req, res, next) {
        try {
            const result = await people_service_1.peopleService.createEmployee(req.body);
            (0, response_1.sendSuccess)(res, 201, result, 'Employee created with portal login');
        }
        catch (error) {
            next(error);
        }
    },
    async setEmployeeCredentials(req, res, next) {
        try {
            const result = await people_service_1.peopleService.setEmployeeCredentials(req.params.id, req.body.password);
            (0, response_1.sendSuccess)(res, 200, result, 'Login password updated');
        }
        catch (error) {
            next(error);
        }
    },
    async myEmployee(req, res, next) {
        try {
            const profile = await people_service_1.peopleService.myEmployee(req.user.id);
            (0, response_1.sendSuccess)(res, 200, { employee: profile }, 'Staff profile fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async addDoc(req, res, next) {
        try {
            const employee = await people_service_1.peopleService.addEmployeeDoc(req.params.id, req.body.title, req.body.file_base64);
            (0, response_1.sendSuccess)(res, 201, { employee }, 'Document added');
        }
        catch (error) {
            next(error);
        }
    },
    async checkIn(req, res, next) {
        try {
            const method = req.body.method === 'qr' ? 'qr' : 'manual';
            const result = await people_service_1.peopleService.checkIn(req.user.id, method);
            (0, response_1.sendSuccess)(res, 200, result, result.already ? 'Already marked today' : 'Attendance marked');
        }
        catch (error) {
            next(error);
        }
    },
    async listAttendance(req, res, next) {
        try {
            const attendance = await people_service_1.peopleService.listAttendance(req.query);
            (0, response_1.sendSuccess)(res, 200, { attendance }, 'Attendance fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async adminMarkAttendance(req, res, next) {
        try {
            const result = await people_service_1.peopleService.adminMarkAttendance(req.body);
            (0, response_1.sendSuccess)(res, 200, result, result.already ? 'Already marked for this date' : 'Attendance marked');
        }
        catch (error) {
            next(error);
        }
    },
    async applyLeave(req, res, next) {
        try {
            const leave = await people_service_1.peopleService.applyLeave(req.user.id, req.body);
            (0, response_1.sendSuccess)(res, 201, { leave }, 'Leave applied');
        }
        catch (error) {
            next(error);
        }
    },
    async listLeave(req, res, next) {
        try {
            const leave = await people_service_1.peopleService.listLeave(req.query.employee_id);
            (0, response_1.sendSuccess)(res, 200, { leave }, 'Leave fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async adminApplyLeave(req, res, next) {
        try {
            const leave = await people_service_1.peopleService.adminApplyLeave(req.body);
            (0, response_1.sendSuccess)(res, 201, { leave }, 'Leave request added');
        }
        catch (error) {
            next(error);
        }
    },
    async decideLeave(req, res, next) {
        try {
            const leave = await people_service_1.peopleService.decideLeave(parseInt(req.params.id, 10), req.body.status);
            (0, response_1.sendSuccess)(res, 200, { leave }, 'Leave updated');
        }
        catch (error) {
            next(error);
        }
    },
    async listAnnouncements(req, res, next) {
        try {
            const announcements = await people_service_1.peopleService.listAnnouncements();
            (0, response_1.sendSuccess)(res, 200, { announcements }, 'Announcements fetched');
        }
        catch (error) {
            next(error);
        }
    },
    async postAnnouncement(req, res, next) {
        try {
            const announcements = await people_service_1.peopleService.postAnnouncement(req.body.title, req.body.body, req.user?.id);
            (0, response_1.sendSuccess)(res, 201, { announcements }, 'Announcement posted');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteAnnouncement(req, res, next) {
        try {
            const announcements = await people_service_1.peopleService.deleteAnnouncement(parseInt(req.params.id, 10));
            (0, response_1.sendSuccess)(res, 200, { announcements }, 'Announcement removed');
        }
        catch (error) {
            next(error);
        }
    },
};
