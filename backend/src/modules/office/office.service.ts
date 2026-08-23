import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { officeModel } from './office.model';
import { generateLetterPdf } from './office.pdf';
import { peopleModel } from '../people/people.model';
import { cmsModel } from '../cms/cms.model';
import { mailService } from '../../services/mail.service';
import { env } from '../../config/env';
import { NotFoundError, ValidationError } from '../../utils/errors';

const STAFF = ['Admin', 'Super Admin'];

function canSeeFile(file: any, role?: string) {
  if (file.visibility === 'public') return true;
  if (!role) return false;
  if (STAFF.includes(role)) return true;
  if (file.visibility === 'admin') return false;
  const allowed = String(file.allowed_roles || '').split(',').map((item) => item.trim());
  return allowed.includes(role);
}

export const officeService = {
  async listFiles(query: any, role?: string, forAdmin = false) {
    const files = await officeModel.listFiles({ search: query.search, folder: query.folder });
    const visible = forAdmin ? files : files.filter((file) => canSeeFile(file, role));
    const folders = [...new Set(['General', 'Policies', 'HR', 'Accounts', 'Legal', 'Letters', ...await officeModel.folders()])];

    let policyDocs: any[] = [];
    if (role && (STAFF.includes(role) || role === 'Employee')) {
      try {
        const cms = await cmsModel.getContent('global', 'policies');
        const docs = Array.isArray(cms?.content) ? cms.content : [];
        policyDocs = docs
          .filter((doc: any) => STAFF.includes(role) || doc.visibility === 'internal' || doc.visibility === 'public')
          .map((doc: any) => ({
            id: `policy-${doc.id}`,
            title: doc.title,
            folder: 'Policies',
            visibility: doc.visibility === 'public' ? 'public' : 'internal',
            url: doc.fileUrl,
            original_name: doc.title,
            source: 'cms',
          }));
      } catch {
        policyDocs = [];
      }
    }

    return { files: [...policyDocs, ...visible], folders };
  },

  async registerUpload(file: Express.Multer.File, body: any, userId?: string) {
    const id = 'FIL-' + randomUUID().split('-')[0].toUpperCase();
    const url = `/uploads/office/${file.filename}`;
    await officeModel.saveFile({
      id,
      filename: file.filename,
      original_name: file.originalname,
      path: file.path,
      url,
      mime_type: file.mimetype,
      size_bytes: file.size,
      uploaded_by: userId || null,
      folder: body.folder || 'General',
      title: body.title || file.originalname,
      visibility: body.visibility || 'internal',
      allowed_roles: body.allowed_roles || 'Admin,Super Admin,Employee',
      description: body.description || null,
    });
    return officeModel.getFile(id);
  },

  async updateFile(id: string, body: any) {
    const file = await officeModel.getFile(id);
    if (!file) throw new NotFoundError('File not found');
    await officeModel.updateFile(id, {
      title: body.title ?? file.title,
      folder: body.folder ?? file.folder,
      visibility: body.visibility ?? file.visibility,
      allowed_roles: body.allowed_roles ?? file.allowed_roles,
      description: body.description ?? file.description,
    });
    return officeModel.getFile(id);
  },

  async deleteFile(id: string) {
    const file = await officeModel.getFile(id);
    if (!file) throw new NotFoundError('File not found');
    if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await officeModel.deleteFile(id);
  },

  listTemplates() {
    return officeModel.listTemplates();
  },

  createTemplate(body: any) {
    if (!body.name || !body.subject || !body.body) throw new ValidationError('Name, subject and body are required');
    return officeModel.createTemplate(body);
  },

  async dispatchLetter(body: any, userId?: string) {
    if (!body.addressee_name || !body.subject || !body.body) {
      throw new ValidationError('Addressee, subject and body are required');
    }
    const letterNo = await officeModel.nextLetterNo();
    const verifyCode = letterNo;
    const id = 'LTR-' + randomUUID().split('-')[0].toUpperCase();
    const filled = String(body.body).replace(/\{\{name\}\}/g, body.addressee_name).replace(/\{\{body\}\}/g, body.extra || '');
    const seal = await officeModel.getSeal();
    const pdfUrl = await generateLetterPdf({
      letter_no: letterNo,
      subject: body.subject,
      body: filled,
      addressee_name: body.addressee_name,
      verify_code: verifyCode,
      seal_url: seal,
    });
    await officeModel.saveLetter({
      id,
      letter_no: letterNo,
      template_id: body.template_id || null,
      subject: body.subject,
      body: filled,
      addressee_name: body.addressee_name,
      addressee_email: body.addressee_email || null,
      addressee_phone: body.addressee_phone || null,
      pdf_url: pdfUrl,
      verify_code: verifyCode,
      created_by: userId || null,
    });
    return officeModel.getLetter(id);
  },

  listLetters(search?: string) {
    return officeModel.listLetters(search);
  },

  async sendLetter(id: string, channel: 'email' | 'whatsapp') {
    const letter = await officeModel.getLetter(id);
    if (!letter) throw new NotFoundError('Letter not found');
    if (channel === 'email') {
      if (!letter.addressee_email) throw new ValidationError('No email on this letter');
      await mailService.sendOfficialLetter(letter, env.CLIENT_URL);
      await officeModel.logSend(letter.id, 'email', letter.addressee_email, 'sent');
      return { letter, channel, status: 'sent' };
    }
    const digits = String(letter.addressee_phone || '').replace(/[^\d]/g, '');
    const phone = digits.length === 10 ? `91${digits}` : digits;
    if (!phone) throw new ValidationError('No phone on this letter');
    const wa = `https://wa.me/${phone}?text=${encodeURIComponent(`KNT letter ${letter.letter_no}: ${letter.subject}. Verify: ${env.CLIENT_URL}/verify/${letter.verify_code}`)}`;
    await officeModel.logSend(letter.id, 'whatsapp', phone, 'logged', wa);
    return { letter, channel, status: 'logged', whatsappUrl: wa };
  },

  listSends(letterId?: string) {
    return officeModel.listSends(letterId);
  },

  async getSeal() {
    return { seal_url: await officeModel.getSeal() };
  },

  async setSeal(file: Express.Multer.File) {
    const url = `/uploads/office/${file.filename}`;
    await officeModel.setSeal(url);
    return { seal_url: url };
  },

  async verify(code: string) {
    const raw = decodeURIComponent(code || '').trim();
    if (!raw) throw new ValidationError('Code is required');

    const letter = await officeModel.getLetter(raw);
    if (letter) {
      return {
        valid: true,
        kind: 'letter',
        code: letter.verify_code,
        title: letter.subject,
        holder: letter.addressee_name,
        number: letter.letter_no,
        issuedAt: letter.dispatched_at,
        pdfUrl: letter.pdf_url,
        status: letter.status,
      };
    }

    const member = await peopleModel.getMembershipByMemberNo(raw);
    if (member) {
      return {
        valid: member.status === 'active',
        kind: 'membership',
        code: member.member_no,
        title: `${member.membership_type} membership`,
        holder: member.name,
        number: member.member_no,
        photoUrl: member.photo_url,
        expiresAt: member.expires_at,
        pdfUrl: member.certificate_url || member.id_card_url,
        status: member.status,
      };
    }

    const volunteer = await peopleModel.getVolunteerByNo(raw);
    if (volunteer) {
      return {
        valid: volunteer.status === 'active',
        kind: 'volunteer',
        code: volunteer.volunteer_no,
        title: 'Volunteer ID',
        holder: volunteer.name,
        number: volunteer.volunteer_no,
        photoUrl: volunteer.photo_url,
        pdfUrl: volunteer.id_card_url,
        status: volunteer.status,
      };
    }

    const eightyG = await officeModel.findEightyG(raw);
    if (eightyG) {
      return {
        valid: true,
        kind: '80g',
        code: eightyG.certificate_no,
        title: '80G certificate',
        holder: eightyG.guest_name || 'Donor',
        number: eightyG.certificate_no,
        issuedAt: eightyG.generated_at,
        amount: eightyG.amount,
        pdfUrl: eightyG.pdf_url,
        status: 'issued',
      };
    }

    return { valid: false, kind: 'unknown', code: raw, title: null, holder: null, status: 'invalid' };
  },
};
