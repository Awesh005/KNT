import bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { peopleModel } from './people.model';
import { peoplePdf, formatCardDate } from './people.pdf';
import { MEMBERSHIP_FEES, saveDataUrl } from './people.util';
import { authModel } from '../auth/auth.model';
import { jobApplicationModel } from '../job-applications/job-application.model';
import { mailService } from '../../services/mail.service';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors';
import { getIndianFY } from '../../utils/fy';
import { env } from '../../config/env';
import { pool } from '../../config/database';

const STAFF_ROLES = ['Admin', 'Super Admin'];

function newId(prefix: string) {
  return `${prefix}-${randomUUID().split('-')[0].toUpperCase()}`;
}

async function ensureUser(name: string, email: string, role: string, mobile?: string | null, password?: string | null) {
  const existing = await authModel.findUserByEmail(email);
  const wantsPassword = Boolean(password && password.trim());
  const plain = wantsPassword ? password!.trim() : randomBytes(5).toString('hex');
  const hash = await bcrypt.hash(plain, 12);

  if (existing) {
    if (STAFF_ROLES.includes(existing.role) && role !== existing.role) {
      throw new ValidationError('This email already belongs to an administrator');
    }
    const nextRole = STAFF_ROLES.includes(existing.role) ? existing.role : role;
    if (wantsPassword) {
      await pool.query(
        `UPDATE users SET name = ?, role = ?, mobile = COALESCE(?, mobile), status = 'active',
          email_verified = 1, email_verify_token = NULL, password_hash = ? WHERE id = ?`,
        [name, nextRole, mobile || null, hash, existing.id]
      );
    } else {
      await pool.query(
        `UPDATE users SET name = ?, role = ?, mobile = COALESCE(?, mobile), status = 'active',
          email_verified = 1, email_verify_token = NULL WHERE id = ?`,
        [name, nextRole, mobile || null, existing.id]
      );
    }
    return {
      user: { id: existing.id, name, email: existing.email, role: nextRole },
      tempPassword: wantsPassword ? plain : null as string | null,
    };
  }

  const userId = 'USR-' + randomUUID().split('-')[0].toUpperCase();
  await pool.query(
    'INSERT INTO users (id, name, email, password_hash, mobile, role, status, email_verified, email_verify_token) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NULL)',
    [userId, name, email, hash, mobile || null, role, 'active']
  );
  return { user: { id: userId, name, email, role }, tempPassword: plain };
}

function expiryFor(type: string, from = new Date()) {
  const start = from.toISOString().slice(0, 10);
  if (type === 'lifetime') return { started_at: start, expires_at: '2099-12-31' };
  const end = new Date(from);
  end.setFullYear(end.getFullYear() + 1);
  return { started_at: start, expires_at: end.toISOString().slice(0, 10) };
}

export const peopleService = {
  async applyMembership(body: any, user?: { id: string; role: string }) {
    if (!body.name || !body.email || !body.membership_type) {
      throw new ValidationError('Name, email and membership type are required');
    }
    const type = body.membership_type;
    if (!MEMBERSHIP_FEES[type]) throw new ValidationError('Invalid membership type');
    const id = newId('MEM');
    await peopleModel.createMembership({
      id,
      user_id: user?.id || null,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      membership_type: type,
      fee: MEMBERSHIP_FEES[type],
      payment_ref: body.payment_ref || null,
      screenshot_url: saveDataUrl(body.screenshot_base64, 'people', `${id}-pay`),
      photo_url: saveDataUrl(body.photo_base64, 'people', `${id}-photo`),
      kyc_pan: body.kyc_pan || null,
      kyc_id_type: body.kyc_id_type || null,
      kyc_id_number: body.kyc_id_number || null,
      address: body.address || null,
      city: body.city || null,
    });
    return peopleModel.getMembership(id);
  },

  listMemberships(status?: string) {
    return peopleModel.listMemberships(status);
  },

  async decideMembership(id: string, status: 'active' | 'rejected') {
    const membership = await peopleModel.getMembership(id);
    if (!membership) throw new NotFoundError('Membership application not found');
    if (status === 'rejected') {
      await peopleModel.updateMembership(id, { status: 'rejected' });
      return peopleModel.getMembership(id);
    }

    const memberNo = membership.member_no || (await peopleModel.nextMemberNo());
    const dates = expiryFor(membership.membership_type);
    const { user, tempPassword } = await ensureUser(membership.name, membership.email, 'Member', membership.phone);
    await peopleModel.updateMembership(id, {
      status: 'active',
      user_id: user.id,
      member_no: memberNo,
      ...dates,
    });
    const updated = await peopleModel.getMembership(id);
    const idCard = await peoplePdf.idCard({
      name: updated.name,
      number: memberNo,
      roleLabel: 'Member ID card',
      extra: `${updated.membership_type} · till ${formatCardDate(updated.expires_at)}`,
      photo_url: updated.photo_url,
      verifyPath: `/verify/${memberNo}`,
    });
    const certificate = await peoplePdf.membershipCertificate(updated);
    const fy = getIndianFY();
    const receiptNo = `KNT/MEM/${fy}/${memberNo.slice(-4)}`;
    const receiptUrl = await peoplePdf.membershipReceipt(updated, receiptNo, fy);
    await peopleModel.saveMembershipReceipt(id, receiptNo, fy, Number(updated.fee), receiptUrl);
    await peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
    const final = await peopleModel.getMembership(id);
    await mailService.sendMembershipApproved(final, tempPassword, env.CLIENT_URL);
    return final;
  },

  async createMembershipByAdmin(body: any) {
    if (!body.name || !body.email) throw new ValidationError('Name and email are required');
    const type = body.membership_type || 'annual';
    if (!MEMBERSHIP_FEES[type]) throw new ValidationError('Invalid membership type');
    if (body.password && String(body.password).trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const email = String(body.email).trim().toLowerCase();
    const existingMembership = await peopleModel.getMembershipByUser('', email);
    if (existingMembership && existingMembership.status !== 'rejected') {
      throw new ValidationError('A membership already exists for this email');
    }

    const id = newId('MEM');
    const { user, tempPassword } = await ensureUser(
      body.name.trim(),
      email,
      'Member',
      body.phone || null,
      body.password || null
    );
    const memberNo = await peopleModel.nextMemberNo();
    const dates = expiryFor(type);
    await peopleModel.createMembership({
      id,
      user_id: user.id,
      name: body.name.trim(),
      email,
      phone: body.phone || null,
      membership_type: type,
      fee: MEMBERSHIP_FEES[type],
      payment_ref: body.payment_ref || 'admin-created',
      screenshot_url: null,
      photo_url: saveDataUrl(body.photo_base64, 'people', `${id}-photo`),
      kyc_pan: body.kyc_pan || null,
      kyc_id_type: body.kyc_id_type || null,
      kyc_id_number: body.kyc_id_number || null,
      address: body.address || null,
      city: body.city || null,
    });
    await peopleModel.updateMembership(id, {
      status: 'active',
      user_id: user.id,
      member_no: memberNo,
      ...dates,
    });
    const updated = await peopleModel.getMembership(id);
    try {
      const idCard = await peoplePdf.idCard({
        name: updated.name,
        number: memberNo,
        roleLabel: 'Member ID card',
        extra: `${updated.membership_type} · till ${formatCardDate(updated.expires_at)}`,
        photo_url: updated.photo_url,
        verifyPath: `/verify/${memberNo}`,
      });
      const certificate = await peoplePdf.membershipCertificate(updated);
      const fy = getIndianFY();
      const receiptNo = `KNT/MEM/${fy}/${memberNo.slice(-4)}`;
      const receiptUrl = await peoplePdf.membershipReceipt(updated, receiptNo, fy);
      await peopleModel.saveMembershipReceipt(id, receiptNo, fy, Number(updated.fee), receiptUrl);
      await peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
    } catch {
      // Login should still work even if PDF generation fails
    }
    const final = await peopleModel.getMembership(id);
    void mailService.sendMembershipApproved(final, tempPassword, env.CLIENT_URL);
    return { membership: final, loginEmail: email, tempPassword };
  },

  async setMembershipCredentials(id: string, password: string) {
    if (!password || password.trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    const membership = await peopleModel.getMembership(id);
    if (!membership) throw new NotFoundError('Membership not found');
    const { user, tempPassword } = await ensureUser(
      membership.name,
      membership.email,
      'Member',
      membership.phone,
      password.trim()
    );
    if (!membership.user_id) {
      await peopleModel.updateMembership(id, { user_id: user.id });
    }
    void mailService.sendMembershipApproved(
      { ...membership, member_no: membership.member_no || 'pending' },
      tempPassword,
      env.CLIENT_URL
    );
    return { email: user.email, tempPassword };
  },

  async reissueMembershipId(id: string) {
    const membership = await peopleModel.getMembership(id);
    if (!membership) throw new NotFoundError('Membership not found');
    if (!membership.member_no) throw new ValidationError('Approve the member first so an ID number exists');
    const idCard = await peoplePdf.idCard({
      name: membership.name,
      number: membership.member_no,
      roleLabel: 'Member ID card',
      extra: `${membership.membership_type} · till ${formatCardDate(membership.expires_at)}`,
      photo_url: membership.photo_url,
      verifyPath: `/verify/${membership.member_no}`,
    });
    const certificate = await peoplePdf.membershipCertificate(membership);
    await peopleModel.updateMembership(id, { id_card_url: idCard, certificate_url: certificate });
    return peopleModel.getMembership(id);
  },

  async createVolunteerByAdmin(body: any) {
    if (!body.name || !body.email) throw new ValidationError('Name and email are required');
    if (body.password && String(body.password).trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    const email = String(body.email).trim().toLowerCase();
    const existing = await peopleModel.getVolunteerByUser('', email);
    if (existing && existing.status !== 'rejected') {
      throw new ValidationError('A volunteer profile already exists for this email');
    }
    const id = newId('VOL');
    const { user, tempPassword } = await ensureUser(body.name.trim(), email, 'Volunteer', body.phone || null, body.password || null);
    const volunteerNo = await peopleModel.nextVolunteerNo();
    await peopleModel.createVolunteer({
      id,
      user_id: user.id,
      name: body.name.trim(),
      email,
      phone: body.phone || null,
      photo_url: saveDataUrl(body.photo_base64, 'people', `${id}-photo`),
      skills: body.skills || '',
      availability: body.availability || 'weekends',
      city: body.city || null,
      message: body.message || 'Added by admin',
    });
    try {
      const idCard = await peoplePdf.idCard({
        name: body.name.trim(),
        number: volunteerNo,
        roleLabel: 'Volunteer ID card',
        extra: body.skills || 'Volunteer',
        photo_url: null,
        verifyPath: `/verify/${volunteerNo}`,
      });
      await peopleModel.updateVolunteer(id, {
        status: 'active',
        user_id: user.id,
        volunteer_no: volunteerNo,
        id_card_url: idCard,
      });
    } catch {
      await peopleModel.updateVolunteer(id, { status: 'active', user_id: user.id, volunteer_no: volunteerNo });
    }
    const volunteer = await peopleModel.getVolunteer(id);
    void mailService.sendVolunteerApproved(volunteer, tempPassword, env.CLIENT_URL);
    return { volunteer, loginEmail: email, tempPassword };
  },

  async setVolunteerCredentials(id: string, password: string) {
    if (!password || password.trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    const volunteer = await peopleModel.getVolunteer(id);
    if (!volunteer) throw new NotFoundError('Volunteer not found');
    const { user, tempPassword } = await ensureUser(volunteer.name, volunteer.email, 'Volunteer', volunteer.phone, password.trim());
    if (!volunteer.user_id) await peopleModel.updateVolunteer(id, { user_id: user.id });
    void mailService.sendVolunteerApproved({ ...volunteer, volunteer_no: volunteer.volunteer_no || 'pending' }, tempPassword, env.CLIENT_URL);
    return { email: user.email, tempPassword };
  },

  async myMembership(user: { id: string; email: string }) {
    const membership = await peopleModel.getMembershipByUser(user.id, user.email);
    if (!membership) throw new NotFoundError('No membership on file');
    const receipts = await peopleModel.listMembershipReceipts(membership.id);
    return { ...membership, receipts };
  },

  async renewMembership(user: { id: string; email: string }, body: any) {
    const membership = await peopleModel.getMembershipByUser(user.id, user.email);
    if (!membership) throw new NotFoundError('No membership on file');
    await peopleModel.updateMembership(membership.id, {
      status: 'pending',
      payment_ref: body.payment_ref || membership.payment_ref,
      screenshot_url: saveDataUrl(body.screenshot_base64, 'people', `${membership.id}-renew`) || membership.screenshot_url,
    });
    return peopleModel.getMembership(membership.id);
  },

  verifyMember(memberNo: string) {
    return peopleModel.getMembershipByMemberNo(memberNo);
  },

  async sendExpiryReminders() {
    const due = await peopleModel.expiringMemberships(30);
    for (const member of due) {
      await mailService.sendMembershipExpiryReminder(member, env.CLIENT_URL);
    }
    return { sent: due.length };
  },

  async applyVolunteer(body: any, user?: { id: string }) {
    if (!body.name || !body.email) throw new ValidationError('Name and email are required');
    const id = newId('VOL');
    await peopleModel.createVolunteer({
      id,
      user_id: user?.id || null,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      photo_url: saveDataUrl(body.photo_base64, 'people', `${id}-photo`),
      skills: Array.isArray(body.skills) ? body.skills.join(', ') : (body.skills || ''),
      availability: body.availability || null,
      city: body.city || null,
      message: body.message || null,
    });
    return peopleModel.getVolunteer(id);
  },

  listVolunteers(status?: string) {
    return peopleModel.listVolunteers(status);
  },

  async decideVolunteer(id: string, status: 'active' | 'rejected') {
    const volunteer = await peopleModel.getVolunteer(id);
    if (!volunteer) throw new NotFoundError('Volunteer not found');
    if (status === 'rejected') {
      await peopleModel.updateVolunteer(id, { status: 'rejected' });
      return peopleModel.getVolunteer(id);
    }
    const volunteerNo = volunteer.volunteer_no || (await peopleModel.nextVolunteerNo());
    const { user, tempPassword } = await ensureUser(volunteer.name, volunteer.email, 'Volunteer', volunteer.phone);
    const idCard = await peoplePdf.idCard({
      name: volunteer.name,
      number: volunteerNo,
      roleLabel: 'Volunteer ID card',
      extra: volunteer.skills || 'Volunteer',
      photo_url: volunteer.photo_url,
      verifyPath: `/verify/${volunteerNo}`,
    });
    await peopleModel.updateVolunteer(id, {
      status: 'active',
      user_id: user.id,
      volunteer_no: volunteerNo,
      id_card_url: idCard,
    });
    const updated = await peopleModel.getVolunteer(id);
    await mailService.sendVolunteerApproved(updated, tempPassword, env.CLIENT_URL);
    return updated;
  },

  verifyPerson(code: string) {
    if (code.startsWith('KNT-V-')) return peopleModel.getVolunteerByNo(code);
    return peopleModel.getMembershipByMemberNo(code);
  },

  async myVolunteer(user: { id: string; email: string }) {
    const volunteer = await peopleModel.getVolunteerByUser(user.id, user.email);
    if (!volunteer) throw new NotFoundError('No volunteer profile');
    const assignments = await peopleModel.listAssignments(volunteer.id);
    const hours = await peopleModel.listHours(volunteer.id);
    return { ...volunteer, assignments, hours };
  },

  async logHours(user: { id: string; email: string }, body: any) {
    const volunteer = await peopleModel.getVolunteerByUser(user.id, user.email);
    if (!volunteer || volunteer.status !== 'active') throw new ForbiddenError('Volunteer profile is not active');
    if (!body.work_date || !body.hours) throw new ValidationError('Date and hours are required');
    await peopleModel.addHours(volunteer.id, body.work_date, Number(body.hours), body.notes);
    return this.myVolunteer(user);
  },

  async addAssignment(volunteerId: string, body: any) {
    if (!body.title) throw new ValidationError('Title is required');
    await peopleModel.addAssignment({ ...body, volunteer_id: volunteerId });
    return peopleModel.getVolunteer(volunteerId);
  },

  async completeAssignment(assignmentId: number, status: string) {
    await peopleModel.updateAssignment(assignmentId, { status });
  },

  listEmployees() {
    return peopleModel.listEmployees();
  },

  async hireFromApplication(body: any) {
    const application = await jobApplicationModel.getApplicationById(Number(body.application_id));
    if (application.status === 'hired') throw new ValidationError('This applicant is already hired');
    const existingStaff = await peopleModel.getEmployeeByUser(
      (await authModel.findUserByEmail(application.email))?.id || ''
    );
    if (existingStaff) throw new ValidationError('This email already has a staff profile');
    const { user, tempPassword } = await ensureUser(application.name, application.email, 'Employee', application.phone);
    const employeeNo = await peopleModel.nextEmployeeNo();
    const id = newId('EMP');
    const joinDate = body.join_date || new Date().toISOString().slice(0, 10);
    const stub = {
      id,
      name: application.name,
      employee_no: employeeNo,
      designation: body.designation || application.job_title,
    };
    const welcome = await peoplePdf.welcomeKit(stub);
    await peopleModel.createEmployee({
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
    await jobApplicationModel.updateApplicationStatus(application.id, 'hired');
    const employee = await peopleModel.getEmployee(id);
    await mailService.sendEmployeeWelcome(employee, tempPassword, env.CLIENT_URL);
    return employee;
  },

  async createEmployee(body: any) {
    if (!body.name || !body.email) throw new ValidationError('Name and email are required');
    if (body.password && String(body.password).trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    const email = String(body.email).trim().toLowerCase();
    const existingUser = await authModel.findUserByEmail(email);
    if (existingUser) {
      const existingStaff = await peopleModel.getEmployeeByUser(existingUser.id);
      if (existingStaff) throw new ValidationError('This email already has a staff profile');
    }
    const { user, tempPassword } = await ensureUser(body.name.trim(), email, 'Employee', body.phone || null, body.password || null);
    const employeeNo = await peopleModel.nextEmployeeNo();
    const id = newId('EMP');
    let welcome: string | null = null;
    try {
      welcome = await peoplePdf.welcomeKit({ name: body.name.trim(), employee_no: employeeNo, designation: body.designation });
    } catch {
      welcome = null;
    }
    await peopleModel.createEmployee({
      id,
      user_id: user.id,
      employee_no: employeeNo,
      designation: body.designation || 'Staff',
      department: body.department || 'Operations',
      join_date: body.join_date || new Date().toISOString().slice(0, 10),
      photo_url: saveDataUrl(body.photo_base64, 'people', `${id}-photo`),
      job_application_id: null,
      welcome_kit_url: welcome,
    });
    const employee = await peopleModel.getEmployee(id);
    void mailService.sendEmployeeWelcome(employee, tempPassword, env.CLIENT_URL);
    return { employee, loginEmail: email, tempPassword };
  },

  async setEmployeeCredentials(id: string, password: string) {
    if (!password || password.trim().length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }
    const employee = await peopleModel.getEmployee(id);
    if (!employee) throw new NotFoundError('Employee not found');
    const { user, tempPassword } = await ensureUser(employee.name, employee.email, 'Employee', employee.mobile, password.trim());
    void mailService.sendEmployeeWelcome(employee, tempPassword, env.CLIENT_URL);
    return { email: user.email, tempPassword };
  },

  async myEmployee(userId: string) {
    const employee = await peopleModel.getEmployeeByUser(userId);
    if (!employee) throw new NotFoundError('Staff profile not found');
    const docs = await peopleModel.listEmployeeDocs(employee.id);
    const balance = await peopleModel.getLeaveBalance(employee.id);
    const leave = await peopleModel.listLeave(employee.id);
    const attendance = await peopleModel.listAttendance(undefined, undefined, employee.id);
    const announcements = await peopleModel.listAnnouncements();
    return { ...employee, docs, balance, leave, attendance, announcements };
  },

  async addEmployeeDoc(employeeId: string, title: string, fileBase64: string) {
    const url = saveDataUrl(fileBase64, 'people', `${employeeId}-doc`);
    if (!url) throw new ValidationError('Document file is required');
    await peopleModel.addEmployeeDoc(employeeId, title || 'Document', url);
    return peopleModel.getEmployee(employeeId);
  },

  checkIn(userId: string, method: 'manual' | 'qr' = 'manual') {
    return this.markAttendanceForUser(userId, method);
  },

  async markAttendanceForUser(userId: string, method: 'manual' | 'qr') {
    const employee = await peopleModel.getEmployeeByUser(userId);
    if (!employee) throw new ForbiddenError('Only staff can mark attendance');
    return peopleModel.markAttendance(employee.id, method);
  },

  async adminMarkAttendance(body: any) {
    if (!body.employee_id) throw new ValidationError('Select a staff member');
    const employee = await peopleModel.getEmployee(body.employee_id);
    if (!employee) throw new NotFoundError('Employee not found');
    const method = body.method === 'qr' ? 'qr' : 'manual';
    return peopleModel.markAttendance(employee.id, method, body.work_date);
  },

  listAttendance(query: any) {
    return peopleModel.listAttendance(query.from, query.to, query.employee_id);
  },

  async applyLeave(userId: string, body: any) {
    const employee = await peopleModel.getEmployeeByUser(userId);
    if (!employee) throw new ForbiddenError('Staff profile required');
    if (!body.leave_type || !body.from_date || !body.to_date) {
      throw new ValidationError('Leave type and dates are required');
    }
    const from = new Date(body.from_date);
    const to = new Date(body.to_date);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    const id = await peopleModel.createLeave({
      employee_id: employee.id,
      leave_type: body.leave_type,
      from_date: body.from_date,
      to_date: body.to_date,
      days,
      reason: body.reason,
    });
    return peopleModel.getLeave(id);
  },

  async adminApplyLeave(body: any) {
    if (!body.employee_id) throw new ValidationError('Select a staff member');
    if (!body.leave_type || !body.from_date || !body.to_date) {
      throw new ValidationError('Leave type and dates are required');
    }
    const employee = await peopleModel.getEmployee(body.employee_id);
    if (!employee) throw new NotFoundError('Employee not found');
    const from = new Date(body.from_date);
    const to = new Date(body.to_date);
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    const id = await peopleModel.createLeave({
      employee_id: employee.id,
      leave_type: body.leave_type,
      from_date: body.from_date,
      to_date: body.to_date,
      days,
      reason: body.reason || 'Added by admin',
    });
    return peopleModel.getLeave(id);
  },

  listLeave(employeeId?: string) {
    return peopleModel.listLeave(employeeId);
  },

  async decideLeave(id: number, status: 'approved' | 'rejected') {
    const leave = await peopleModel.getLeave(id);
    if (!leave) throw new NotFoundError('Leave request not found');
    if (leave.status !== 'pending') throw new ValidationError('Leave already decided');
    await peopleModel.updateLeave(id, status);
    if (status === 'approved') {
      const field = leave.leave_type;
      if (['casual', 'sick', 'earned'].includes(field)) {
        await peopleModel.updateLeaveBalance(leave.employee_id, field, -Number(leave.days));
      }
    }
    return peopleModel.getLeave(id);
  },

  listAnnouncements() {
    return peopleModel.listAnnouncements();
  },

  async postAnnouncement(title: string, body: string, userId?: string) {
    if (!title || !body) throw new ValidationError('Title and body are required');
    await peopleModel.createAnnouncement(title, body, userId);
    return peopleModel.listAnnouncements();
  },

  async deleteAnnouncement(id: number) {
    const ok = await peopleModel.deleteAnnouncement(id);
    if (!ok) throw new NotFoundError('Announcement not found');
    return peopleModel.listAnnouncements();
  },
};
