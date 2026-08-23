"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const people_model_1 = require("./people.model");
const people_pdf_1 = require("./people.pdf");
const people_util_1 = require("./people.util");
const auth_model_1 = require("../auth/auth.model");
const job_application_model_1 = require("../job-applications/job-application.model");
const mail_service_1 = require("../../services/mail.service");
const errors_1 = require("../../utils/errors");
const fy_1 = require("../../utils/fy");
const env_1 = require("../../config/env");
const database_1 = require("../../config/database");
const STAFF_ROLES = ['Admin', 'Super Admin'];
function newId(prefix) {
    return `${prefix}-${(0, crypto_1.randomUUID)().split('-')[0].toUpperCase()}`;
}
async function ensureUser(name, email, role, mobile, password) {
    const existing = await auth_model_1.authModel.findUserByEmail(email);
    const wantsPassword = Boolean(password && password.trim());
    const plain = wantsPassword ? password.trim() : (0, crypto_1.randomBytes)(5).toString('hex');
    const hash = await bcrypt_1.default.hash(plain, 12);
    if (existing) {
        if (STAFF_ROLES.includes(existing.role) && role !== existing.role) {
            throw new errors_1.ValidationError('This email already belongs to an administrator');
        }
        const nextRole = STAFF_ROLES.includes(existing.role) ? existing.role : role;
        if (wantsPassword) {
            await database_1.pool.query(`UPDATE users SET name = ?, role = ?, mobile = COALESCE(?, mobile), status = 'active',
          email_verified = 1, email_verify_token = NULL, password_hash = ? WHERE id = ?`, [name, nextRole, mobile || null, hash, existing.id]);
        }
        else {
            await database_1.pool.query(`UPDATE users SET name = ?, role = ?, mobile = COALESCE(?, mobile), status = 'active',
          email_verified = 1, email_verify_token = NULL WHERE id = ?`, [name, nextRole, mobile || null, existing.id]);
        }
        return {
            user: { id: existing.id, name, email: existing.email, role: nextRole },
            tempPassword: wantsPassword ? plain : null,
        };
    }
    const userId = 'USR-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
    await database_1.pool.query('INSERT INTO users (id, name, email, password_hash, mobile, role, status, email_verified, email_verify_token) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL)', [userId, name, email, hash, mobile || null, role, 'active']);
    return { user: { id: userId, name, email, role }, tempPassword: plain };
}
function expiryFor(type, from = new Date()) {
    const start = from.toISOString().slice(0, 10);
    if (type === 'lifetime')
        return { started_at: start, expires_at: '2099-12-31' };
    const end = new Date(from);
    end.setFullYear(end.getFullYear() + 1);
    return { started_at: start, expires_at: end.toISOString().slice(0, 10) };
}
exports.peopleService = {
    async applyMembership(body, user) {
        if (!body.name || !body.email || !body.membership_type) {
            throw new errors_1.ValidationError('Name, email and membership type are required');
        }
        const type = body.membership_type;
        if (!people_util_1.MEMBERSHIP_FEES[type])
            throw new errors_1.ValidationError('Invalid membership type');
        const id = newId('MEM');
        await people_model_1.peopleModel.createMembership({
            id,
            user_id: user?.id || null,
            name: body.name,
            email: body.email,
            phone: body.phone || null,
            membership_type: type,
            fee: people_util_1.MEMBERSHIP_FEES[type],
            payment_ref: body.payment_ref || null,
            screenshot_url: (0, people_util_1.saveDataUrl)(body.screenshot_base64, 'people', `${id}-pay`),
            photo_url: (0, people_util_1.saveDataUrl)(body.photo_base64, 'people', `${id}-photo`),
            kyc_pan: body.kyc_pan || null,
            kyc_id_type: body.kyc_id_type || null,
            kyc_id_number: body.kyc_id_number || null,
            address: body.address || null,
            city: body.city || null,
        });
        return people_model_1.peopleModel.getMembership(id);
    },
    listMemberships(status) {
        return people_model_1.peopleModel.listMemberships(status);
    },
    async decideMembership(id, status) {
        const membership = await people_model_1.peopleModel.getMembership(id);
        if (!membership)
            throw new errors_1.NotFoundError('Membership application not found');
        if (status === 'rejected') {
            await people_model_1.peopleModel.updateMembership(id, { status: 'rejected' });
            return people_model_1.peopleModel.getMembership(id);
        }
        const memberNo = membership.member_no || (await people_model_1.peopleModel.nextMemberNo());
        const dates = expiryFor(membership.membership_type);
        const { user, tempPassword } = await ensureUser(membership.name, membership.email, 'Member', membership.phone);
        await people_model_1.peopleModel.updateMembership(id, {
            status: 'active',
            user_id: user.id,
            member_no: memberNo,
            ...dates,
        });
        const updated = await people_model_1.peopleModel.getMembership(id);
        const idCard = await people_pdf_1.peoplePdf.idCard({
            name: updated.name,
            number: memberNo,
            roleLabel: 'Member ID card',
            extra: `${updated.membership_type} · till ${(0, people_pdf_1.formatCardDate)(updated.expires_at)}`,
            photo_url: updated.photo_url,
            verifyPath: `/verify/${memberNo}`,
        });
        const certificate = await people_pdf_1.peoplePdf.membershipCertificate(updated);
        const fy = (0, fy_1.getIndianFY)();
        const receiptNo = `KNT/MEM/${fy}/${memberNo.slice(-4)}`;
        const receiptUrl = await people_pdf_1.peoplePdf.membershipReceipt(updated, receiptNo, fy);
        await people_model_1.peopleModel.saveMembershipReceipt(id, receiptNo, fy, Number(updated.fee), receiptUrl);
        await people_model_1.peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
        const final = await people_model_1.peopleModel.getMembership(id);
        await mail_service_1.mailService.sendMembershipApproved(final, tempPassword, env_1.env.CLIENT_URL);
        return final;
    },
    async createMembershipByAdmin(body) {
        if (!body.name || !body.email)
            throw new errors_1.ValidationError('Name and email are required');
        const type = body.membership_type || 'annual';
        if (!people_util_1.MEMBERSHIP_FEES[type])
            throw new errors_1.ValidationError('Invalid membership type');
        if (body.password && String(body.password).trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const email = String(body.email).trim().toLowerCase();
        const existingMembership = await people_model_1.peopleModel.getMembershipByUser('', email);
        if (existingMembership && existingMembership.status !== 'rejected') {
            throw new errors_1.ValidationError('A membership already exists for this email');
        }
        const id = newId('MEM');
        const { user, tempPassword } = await ensureUser(body.name.trim(), email, 'Member', body.phone || null, body.password || null);
        const memberNo = await people_model_1.peopleModel.nextMemberNo();
        const dates = expiryFor(type);
        await people_model_1.peopleModel.createMembership({
            id,
            user_id: user.id,
            name: body.name.trim(),
            email,
            phone: body.phone || null,
            membership_type: type,
            fee: people_util_1.MEMBERSHIP_FEES[type],
            payment_ref: body.payment_ref || 'admin-created',
            screenshot_url: null,
            photo_url: (0, people_util_1.saveDataUrl)(body.photo_base64, 'people', `${id}-photo`),
            kyc_pan: body.kyc_pan || null,
            kyc_id_type: body.kyc_id_type || null,
            kyc_id_number: body.kyc_id_number || null,
            address: body.address || null,
            city: body.city || null,
        });
        await people_model_1.peopleModel.updateMembership(id, {
            status: 'active',
            user_id: user.id,
            member_no: memberNo,
            ...dates,
        });
        const updated = await people_model_1.peopleModel.getMembership(id);
        try {
            const idCard = await people_pdf_1.peoplePdf.idCard({
                name: updated.name,
                number: memberNo,
                roleLabel: 'Member ID card',
                extra: `${updated.membership_type} · till ${(0, people_pdf_1.formatCardDate)(updated.expires_at)}`,
                photo_url: updated.photo_url,
                verifyPath: `/verify/${memberNo}`,
            });
            const certificate = await people_pdf_1.peoplePdf.membershipCertificate(updated);
            const fy = (0, fy_1.getIndianFY)();
            const receiptNo = `KNT/MEM/${fy}/${memberNo.slice(-4)}`;
            const receiptUrl = await people_pdf_1.peoplePdf.membershipReceipt(updated, receiptNo, fy);
            await people_model_1.peopleModel.saveMembershipReceipt(id, receiptNo, fy, Number(updated.fee), receiptUrl);
            await people_model_1.peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
        }
        catch {
            // Login should still work even if PDF generation fails
        }
        const final = await people_model_1.peopleModel.getMembership(id);
        void mail_service_1.mailService.sendMembershipApproved(final, tempPassword, env_1.env.CLIENT_URL);
        return { membership: final, loginEmail: email, tempPassword };
    },
    async setMembershipCredentials(id, password) {
        if (!password || password.trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const membership = await people_model_1.peopleModel.getMembership(id);
        if (!membership)
            throw new errors_1.NotFoundError('Membership not found');
        const { user, tempPassword } = await ensureUser(membership.name, membership.email, 'Member', membership.phone, password.trim());
        if (!membership.user_id) {
            await people_model_1.peopleModel.updateMembership(id, { user_id: user.id });
        }
        void mail_service_1.mailService.sendMembershipApproved({ ...membership, member_no: membership.member_no || 'pending' }, tempPassword, env_1.env.CLIENT_URL);
        return { email: user.email, tempPassword };
    },
    async reissueMembershipId(id) {
        const membership = await people_model_1.peopleModel.getMembership(id);
        if (!membership)
            throw new errors_1.NotFoundError('Membership not found');
        if (!membership.member_no)
            throw new errors_1.ValidationError('Approve the member first so an ID number exists');
        const idCard = await people_pdf_1.peoplePdf.idCard({
            name: membership.name,
            number: membership.member_no,
            roleLabel: 'Member ID card',
            extra: `${membership.membership_type} · till ${(0, people_pdf_1.formatCardDate)(membership.expires_at)}`,
            photo_url: membership.photo_url,
            verifyPath: `/verify/${membership.member_no}`,
        });
        const certificate = await people_pdf_1.peoplePdf.membershipCertificate(membership);
        await people_model_1.peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
        return people_model_1.peopleModel.getMembership(id);
    },
    async createVolunteerByAdmin(body) {
        if (!body.name || !body.email)
            throw new errors_1.ValidationError('Name and email are required');
        if (body.password && String(body.password).trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const email = String(body.email).trim().toLowerCase();
        const existing = await people_model_1.peopleModel.getVolunteerByUser('', email);
        if (existing && existing.status !== 'rejected') {
            throw new errors_1.ValidationError('A volunteer profile already exists for this email');
        }
        const id = newId('VOL');
        const { user, tempPassword } = await ensureUser(body.name.trim(), email, 'Volunteer', body.phone || null, body.password || null);
        const volunteerNo = await people_model_1.peopleModel.nextVolunteerNo();
        await people_model_1.peopleModel.createVolunteer({
            id,
            user_id: user.id,
            name: body.name.trim(),
            email,
            phone: body.phone || null,
            photo_url: (0, people_util_1.saveDataUrl)(body.photo_base64, 'people', `${id}-photo`),
            skills: body.skills || '',
            availability: body.availability || 'weekends',
            city: body.city || null,
            message: body.message || 'Added by admin',
        });
        try {
            const idCard = await people_pdf_1.peoplePdf.idCard({
                name: body.name.trim(),
                number: volunteerNo,
                roleLabel: 'Volunteer ID card',
                extra: body.skills || 'Volunteer',
                photo_url: null,
                verifyPath: `/verify/${volunteerNo}`,
            });
            await people_model_1.peopleModel.updateVolunteer(id, {
                status: 'active',
                user_id: user.id,
                volunteer_no: volunteerNo,
                id_card_url: idCard,
            });
        }
        catch {
            await people_model_1.peopleModel.updateVolunteer(id, { status: 'active', user_id: user.id, volunteer_no: volunteerNo });
        }
        const volunteer = await people_model_1.peopleModel.getVolunteer(id);
        void mail_service_1.mailService.sendVolunteerApproved(volunteer, tempPassword, env_1.env.CLIENT_URL);
        return { volunteer, loginEmail: email, tempPassword };
    },
    async setVolunteerCredentials(id, password) {
        if (!password || password.trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const volunteer = await people_model_1.peopleModel.getVolunteer(id);
        if (!volunteer)
            throw new errors_1.NotFoundError('Volunteer not found');
        const { user, tempPassword } = await ensureUser(volunteer.name, volunteer.email, 'Volunteer', volunteer.phone, password.trim());
        if (!volunteer.user_id)
            await people_model_1.peopleModel.updateVolunteer(id, { user_id: user.id });
        void mail_service_1.mailService.sendVolunteerApproved({ ...volunteer, volunteer_no: volunteer.volunteer_no || 'pending' }, tempPassword, env_1.env.CLIENT_URL);
        return { email: user.email, tempPassword };
    },
    async myMembership(user) {
        const membership = await people_model_1.peopleModel.getMembershipByUser(user.id, user.email);
        if (!membership)
            throw new errors_1.NotFoundError('No membership on file');
        const receipts = await people_model_1.peopleModel.listMembershipReceipts(membership.id);
        return { ...membership, receipts };
    },
    async renewMembership(user, body) {
        const membership = await people_model_1.peopleModel.getMembershipByUser(user.id, user.email);
        if (!membership)
            throw new errors_1.NotFoundError('No membership on file');
        await people_model_1.peopleModel.updateMembership(membership.id, {
            status: 'pending',
            payment_ref: body.payment_ref || membership.payment_ref,
            screenshot_url: (0, people_util_1.saveDataUrl)(body.screenshot_base64, 'people', `${membership.id}-renew`) || membership.screenshot_url,
        });
        return people_model_1.peopleModel.getMembership(membership.id);
    },
    verifyMember(memberNo) {
        return people_model_1.peopleModel.getMembershipByMemberNo(memberNo);
    },
    async sendExpiryReminders() {
        const due = await people_model_1.peopleModel.expiringMemberships(30);
        for (const member of due) {
            await mail_service_1.mailService.sendMembershipExpiryReminder(member, env_1.env.CLIENT_URL);
        }
        return { sent: due.length };
    },
    async applyVolunteer(body, user) {
        if (!body.name || !body.email)
            throw new errors_1.ValidationError('Name and email are required');
        const id = newId('VOL');
        await people_model_1.peopleModel.createVolunteer({
            id,
            user_id: user?.id || null,
            name: body.name,
            email: body.email,
            phone: body.phone || null,
            photo_url: (0, people_util_1.saveDataUrl)(body.photo_base64, 'people', `${id}-photo`),
            skills: Array.isArray(body.skills) ? body.skills.join(', ') : (body.skills || ''),
            availability: body.availability || null,
            city: body.city || null,
            message: body.message || null,
        });
        return people_model_1.peopleModel.getVolunteer(id);
    },
    listVolunteers(status) {
        return people_model_1.peopleModel.listVolunteers(status);
    },
    async decideVolunteer(id, status) {
        const volunteer = await people_model_1.peopleModel.getVolunteer(id);
        if (!volunteer)
            throw new errors_1.NotFoundError('Volunteer not found');
        if (status === 'rejected') {
            await people_model_1.peopleModel.updateVolunteer(id, { status: 'rejected' });
            return people_model_1.peopleModel.getVolunteer(id);
        }
        const volunteerNo = volunteer.volunteer_no || (await people_model_1.peopleModel.nextVolunteerNo());
        const { user, tempPassword } = await ensureUser(volunteer.name, volunteer.email, 'Volunteer', volunteer.phone);
        const idCard = await people_pdf_1.peoplePdf.idCard({
            name: volunteer.name,
            number: volunteerNo,
            roleLabel: 'Volunteer ID card',
            extra: volunteer.skills || 'Volunteer',
            photo_url: volunteer.photo_url,
            verifyPath: `/verify/${volunteerNo}`,
        });
        await people_model_1.peopleModel.updateVolunteer(id, {
            status: 'active',
            user_id: user.id,
            volunteer_no: volunteerNo,
            id_card_url: idCard,
        });
        const updated = await people_model_1.peopleModel.getVolunteer(id);
        await mail_service_1.mailService.sendVolunteerApproved(updated, tempPassword, env_1.env.CLIENT_URL);
        return updated;
    },
    verifyPerson(code) {
        if (code.startsWith('KNT-V-'))
            return people_model_1.peopleModel.getVolunteerByNo(code);
        return people_model_1.peopleModel.getMembershipByMemberNo(code);
    },
    async myVolunteer(user) {
        const volunteer = await people_model_1.peopleModel.getVolunteerByUser(user.id, user.email);
        if (!volunteer)
            throw new errors_1.NotFoundError('No volunteer profile');
        const assignments = await people_model_1.peopleModel.listAssignments(volunteer.id);
        const hours = await people_model_1.peopleModel.listHours(volunteer.id);
        return { ...volunteer, assignments, hours };
    },
    async logHours(user, body) {
        const volunteer = await people_model_1.peopleModel.getVolunteerByUser(user.id, user.email);
        if (!volunteer || volunteer.status !== 'active')
            throw new errors_1.ForbiddenError('Volunteer profile is not active');
        if (!body.work_date || !body.hours)
            throw new errors_1.ValidationError('Date and hours are required');
        await people_model_1.peopleModel.addHours(volunteer.id, body.work_date, Number(body.hours), body.notes);
        return this.myVolunteer(user);
    },
    async addAssignment(volunteerId, body) {
        if (!body.title)
            throw new errors_1.ValidationError('Title is required');
        await people_model_1.peopleModel.addAssignment({ ...body, volunteer_id: volunteerId });
        return people_model_1.peopleModel.getVolunteer(volunteerId);
    },
    async completeAssignment(assignmentId, status) {
        await people_model_1.peopleModel.updateAssignment(assignmentId, { status });
    },
    listEmployees() {
        return people_model_1.peopleModel.listEmployees();
    },
    async hireFromApplication(body) {
        const application = await job_application_model_1.jobApplicationModel.getApplicationById(Number(body.application_id));
        if (application.status === 'hired')
            throw new errors_1.ValidationError('This applicant is already hired');
        const existingStaff = await people_model_1.peopleModel.getEmployeeByUser((await auth_model_1.authModel.findUserByEmail(application.email))?.id || '');
        if (existingStaff)
            throw new errors_1.ValidationError('This email already has a staff profile');
        const { user, tempPassword } = await ensureUser(application.name, application.email, 'Employee', application.phone);
        const employeeNo = await people_model_1.peopleModel.nextEmployeeNo();
        const id = newId('EMP');
        const joinDate = body.join_date || new Date().toISOString().slice(0, 10);
        const stub = {
            id,
            name: application.name,
            employee_no: employeeNo,
            designation: body.designation || application.job_title,
        };
        const welcome = await people_pdf_1.peoplePdf.welcomeKit(stub);
        await people_model_1.peopleModel.createEmployee({
            id,
            user_id: user.id,
            employee_no: employeeNo,
            designation: body.designation || application.job_title,
            department: body.department || 'Operations',
            join_date: joinDate,
            photo_url: application.documents?.photo || null,
            job_application_id: application.id,
            welcome_kit_url: welcome,
        });
        await job_application_model_1.jobApplicationModel.updateApplicationStatus(application.id, 'hired');
        const employee = await people_model_1.peopleModel.getEmployee(id);
        await mail_service_1.mailService.sendEmployeeWelcome(employee, tempPassword, env_1.env.CLIENT_URL);
        return employee;
    },
    async createEmployee(body) {
        if (!body.name || !body.email)
            throw new errors_1.ValidationError('Name and email are required');
        if (body.password && String(body.password).trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const email = String(body.email).trim().toLowerCase();
        const existingUser = await auth_model_1.authModel.findUserByEmail(email);
        if (existingUser) {
            const existingStaff = await people_model_1.peopleModel.getEmployeeByUser(existingUser.id);
            if (existingStaff)
                throw new errors_1.ValidationError('This email already has a staff profile');
        }
        const { user, tempPassword } = await ensureUser(body.name.trim(), email, 'Employee', body.phone || null, body.password || null);
        const employeeNo = await people_model_1.peopleModel.nextEmployeeNo();
        const id = newId('EMP');
        let welcome = null;
        try {
            welcome = await people_pdf_1.peoplePdf.welcomeKit({ name: body.name.trim(), employee_no: employeeNo, designation: body.designation });
        }
        catch {
            welcome = null;
        }
        await people_model_1.peopleModel.createEmployee({
            id,
            user_id: user.id,
            employee_no: employeeNo,
            designation: body.designation || 'Staff',
            department: body.department || 'Operations',
            join_date: body.join_date || new Date().toISOString().slice(0, 10),
            photo_url: (0, people_util_1.saveDataUrl)(body.photo_base64, 'people', `${id}-photo`),
            job_application_id: null,
            welcome_kit_url: welcome,
        });
        const employee = await people_model_1.peopleModel.getEmployee(id);
        void mail_service_1.mailService.sendEmployeeWelcome(employee, tempPassword, env_1.env.CLIENT_URL);
        return { employee, loginEmail: email, tempPassword };
    },
    async setEmployeeCredentials(id, password) {
        if (!password || password.trim().length < 6) {
            throw new errors_1.ValidationError('Password must be at least 6 characters');
        }
        const employee = await people_model_1.peopleModel.getEmployee(id);
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const { user, tempPassword } = await ensureUser(employee.name, employee.email, 'Employee', employee.mobile, password.trim());
        void mail_service_1.mailService.sendEmployeeWelcome(employee, tempPassword, env_1.env.CLIENT_URL);
        return { email: user.email, tempPassword };
    },
    async myEmployee(userId) {
        const employee = await people_model_1.peopleModel.getEmployeeByUser(userId);
        if (!employee)
            throw new errors_1.NotFoundError('Staff profile not found');
        const docs = await people_model_1.peopleModel.listEmployeeDocs(employee.id);
        const balance = await people_model_1.peopleModel.getLeaveBalance(employee.id);
        const leave = await people_model_1.peopleModel.listLeave(employee.id);
        const attendance = await people_model_1.peopleModel.listAttendance(undefined, undefined, employee.id);
        const announcements = await people_model_1.peopleModel.listAnnouncements();
        return { ...employee, docs, balance, leave, attendance, announcements };
    },
    async addEmployeeDoc(employeeId, title, fileBase64) {
        const url = (0, people_util_1.saveDataUrl)(fileBase64, 'people', `${employeeId}-doc`);
        if (!url)
            throw new errors_1.ValidationError('Document file is required');
        await people_model_1.peopleModel.addEmployeeDoc(employeeId, title || 'Document', url);
        return people_model_1.peopleModel.getEmployee(employeeId);
    },
    checkIn(userId, method = 'manual') {
        return this.markAttendanceForUser(userId, method);
    },
    async markAttendanceForUser(userId, method) {
        const employee = await people_model_1.peopleModel.getEmployeeByUser(userId);
        if (!employee)
            throw new errors_1.ForbiddenError('Only staff can mark attendance');
        return people_model_1.peopleModel.markAttendance(employee.id, method);
    },
    async adminMarkAttendance(body) {
        if (!body.employee_id)
            throw new errors_1.ValidationError('Select a staff member');
        const employee = await people_model_1.peopleModel.getEmployee(body.employee_id);
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const method = body.method === 'qr' ? 'qr' : 'manual';
        return people_model_1.peopleModel.markAttendance(employee.id, method, body.work_date);
    },
    listAttendance(query) {
        return people_model_1.peopleModel.listAttendance(query.from, query.to, query.employee_id);
    },
    async applyLeave(userId, body) {
        const employee = await people_model_1.peopleModel.getEmployeeByUser(userId);
        if (!employee)
            throw new errors_1.ForbiddenError('Staff profile required');
        if (!body.leave_type || !body.from_date || !body.to_date) {
            throw new errors_1.ValidationError('Leave type and dates are required');
        }
        const from = new Date(body.from_date);
        const to = new Date(body.to_date);
        const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
        const id = await people_model_1.peopleModel.createLeave({
            employee_id: employee.id,
            leave_type: body.leave_type,
            from_date: body.from_date,
            to_date: body.to_date,
            days,
            reason: body.reason,
        });
        return people_model_1.peopleModel.getLeave(id);
    },
    async adminApplyLeave(body) {
        if (!body.employee_id)
            throw new errors_1.ValidationError('Select a staff member');
        if (!body.leave_type || !body.from_date || !body.to_date) {
            throw new errors_1.ValidationError('Leave type and dates are required');
        }
        const employee = await people_model_1.peopleModel.getEmployee(body.employee_id);
        if (!employee)
            throw new errors_1.NotFoundError('Employee not found');
        const from = new Date(body.from_date);
        const to = new Date(body.to_date);
        const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
        const id = await people_model_1.peopleModel.createLeave({
            employee_id: employee.id,
            leave_type: body.leave_type,
            from_date: body.from_date,
            to_date: body.to_date,
            days,
            reason: body.reason || 'Added by admin',
        });
        return people_model_1.peopleModel.getLeave(id);
    },
    listLeave(employeeId) {
        return people_model_1.peopleModel.listLeave(employeeId);
    },
    async decideLeave(id, status) {
        const leave = await people_model_1.peopleModel.getLeave(id);
        if (!leave)
            throw new errors_1.NotFoundError('Leave request not found');
        if (leave.status !== 'pending')
            throw new errors_1.ValidationError('Leave already decided');
        await people_model_1.peopleModel.updateLeave(id, status);
        if (status === 'approved') {
            const field = leave.leave_type;
            if (['casual', 'sick', 'earned'].includes(field)) {
                await people_model_1.peopleModel.updateLeaveBalance(leave.employee_id, field, -Number(leave.days));
            }
        }
        return people_model_1.peopleModel.getLeave(id);
    },
    listAnnouncements() {
        return people_model_1.peopleModel.listAnnouncements();
    },
    async postAnnouncement(title, body, userId) {
        if (!title || !body)
            throw new errors_1.ValidationError('Title and body are required');
        await people_model_1.peopleModel.createAnnouncement(title, body, userId);
        return people_model_1.peopleModel.listAnnouncements();
    },
    async deleteAnnouncement(id) {
        const ok = await people_model_1.peopleModel.deleteAnnouncement(id);
        if (!ok)
            throw new errors_1.NotFoundError('Announcement not found');
        return people_model_1.peopleModel.listAnnouncements();
    },
};
