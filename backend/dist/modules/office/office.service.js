"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.officeService = void 0;
const crypto_1 = require("crypto");
const fs_1 = __importDefault(require("fs"));
const office_model_1 = require("./office.model");
const office_pdf_1 = require("./office.pdf");
const people_model_1 = require("../people/people.model");
const cms_model_1 = require("../cms/cms.model");
const mail_service_1 = require("../../services/mail.service");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const STAFF = ['Admin', 'Super Admin'];
function canSeeFile(file, role) {
    if (file.visibility === 'public')
        return true;
    if (!role)
        return false;
    if (STAFF.includes(role))
        return true;
    if (file.visibility === 'admin')
        return false;
    const allowed = String(file.allowed_roles || '').split(',').map((item) => item.trim());
    return allowed.includes(role);
}
exports.officeService = {
    async listFiles(query, role, forAdmin = false) {
        const files = await office_model_1.officeModel.listFiles({ search: query.search, folder: query.folder });
        const visible = forAdmin ? files : files.filter((file) => canSeeFile(file, role));
        const folders = [...new Set(['General', 'Policies', 'HR', 'Accounts', 'Legal', 'Letters', ...await office_model_1.officeModel.folders()])];
        let policyDocs = [];
        if (role && (STAFF.includes(role) || role === 'Employee')) {
            try {
                const cms = await cms_model_1.cmsModel.getContent('global', 'policies');
                const docs = Array.isArray(cms?.content) ? cms.content : [];
                policyDocs = docs
                    .filter((doc) => STAFF.includes(role) || doc.visibility === 'internal' || doc.visibility === 'public')
                    .map((doc) => ({
                    id: `policy-${doc.id}`,
                    title: doc.title,
                    folder: 'Policies',
                    visibility: doc.visibility === 'public' ? 'public' : 'internal',
                    url: doc.fileUrl,
                    original_name: doc.title,
                    source: 'cms',
                }));
            }
            catch {
                policyDocs = [];
            }
        }
        return { files: [...policyDocs, ...visible], folders };
    },
    async registerUpload(file, body, userId) {
        const id = 'FIL-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        const url = `/uploads/office/${file.filename}`;
        await office_model_1.officeModel.saveFile({
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
        return office_model_1.officeModel.getFile(id);
    },
    async updateFile(id, body) {
        const file = await office_model_1.officeModel.getFile(id);
        if (!file)
            throw new errors_1.NotFoundError('File not found');
        await office_model_1.officeModel.updateFile(id, {
            title: body.title ?? file.title,
            folder: body.folder ?? file.folder,
            visibility: body.visibility ?? file.visibility,
            allowed_roles: body.allowed_roles ?? file.allowed_roles,
            description: body.description ?? file.description,
        });
        return office_model_1.officeModel.getFile(id);
    },
    async deleteFile(id) {
        const file = await office_model_1.officeModel.getFile(id);
        if (!file)
            throw new errors_1.NotFoundError('File not found');
        if (file.path && fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        await office_model_1.officeModel.deleteFile(id);
    },
    listTemplates() {
        return office_model_1.officeModel.listTemplates();
    },
    createTemplate(body) {
        if (!body.name || !body.subject || !body.body)
            throw new errors_1.ValidationError('Name, subject and body are required');
        return office_model_1.officeModel.createTemplate(body);
    },
    async dispatchLetter(body, userId) {
        if (!body.addressee_name || !body.subject || !body.body) {
            throw new errors_1.ValidationError('Addressee, subject and body are required');
        }
        const letterNo = await office_model_1.officeModel.nextLetterNo();
        const verifyCode = letterNo;
        const id = 'LTR-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        const filled = String(body.body).replace(/\{\{name\}\}/g, body.addressee_name).replace(/\{\{body\}\}/g, body.extra || '');
        const seal = await office_model_1.officeModel.getSeal();
        const pdfUrl = await (0, office_pdf_1.generateLetterPdf)({
            letter_no: letterNo,
            subject: body.subject,
            body: filled,
            addressee_name: body.addressee_name,
            verify_code: verifyCode,
            seal_url: seal,
        });
        await office_model_1.officeModel.saveLetter({
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
        return office_model_1.officeModel.getLetter(id);
    },
    listLetters(search) {
        return office_model_1.officeModel.listLetters(search);
    },
    async sendLetter(id, channel) {
        const letter = await office_model_1.officeModel.getLetter(id);
        if (!letter)
            throw new errors_1.NotFoundError('Letter not found');
        if (channel === 'email') {
            if (!letter.addressee_email)
                throw new errors_1.ValidationError('No email on this letter');
            await mail_service_1.mailService.sendOfficialLetter(letter, env_1.env.CLIENT_URL);
            await office_model_1.officeModel.logSend(letter.id, 'email', letter.addressee_email, 'sent');
            return { letter, channel, status: 'sent' };
        }
        const digits = String(letter.addressee_phone || '').replace(/[^\d]/g, '');
        const phone = digits.length === 10 ? `91${digits}` : digits;
        if (!phone)
            throw new errors_1.ValidationError('No phone on this letter');
        const wa = `https://wa.me/${phone}?text=${encodeURIComponent(`KNT letter ${letter.letter_no}: ${letter.subject}. Verify: ${env_1.env.CLIENT_URL}/verify/${letter.verify_code}`)}`;
        await office_model_1.officeModel.logSend(letter.id, 'whatsapp', phone, 'logged', wa);
        return { letter, channel, status: 'logged', whatsappUrl: wa };
    },
    listSends(letterId) {
        return office_model_1.officeModel.listSends(letterId);
    },
    async getSeal() {
        return { seal_url: await office_model_1.officeModel.getSeal() };
    },
    async setSeal(file) {
        const url = `/uploads/office/${file.filename}`;
        await office_model_1.officeModel.setSeal(url);
        return { seal_url: url };
    },
    async verify(code) {
        const raw = decodeURIComponent(code || '').trim();
        if (!raw)
            throw new errors_1.ValidationError('Code is required');
        const letter = await office_model_1.officeModel.getLetter(raw);
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
        const member = await people_model_1.peopleModel.getMembershipByMemberNo(raw);
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
        const volunteer = await people_model_1.peopleModel.getVolunteerByNo(raw);
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
        const eightyG = await office_model_1.officeModel.findEightyG(raw);
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
