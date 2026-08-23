"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
let transporter = null;
function getTransporter() {
    if (!env_1.env.SMTP_HOST || !env_1.env.SMTP_USER) {
        return null;
    }
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: env_1.env.SMTP_HOST,
            port: parseInt(env_1.env.SMTP_PORT || '587', 10),
            secure: env_1.env.SMTP_PORT === '465',
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASS,
            },
        });
    }
    return transporter;
}
function resolveUploadPath(fileUrl) {
    if (!fileUrl)
        return null;
    const relative = fileUrl.replace(/^\//, '');
    const candidates = [
        path_1.default.join(process.cwd(), relative),
        path_1.default.join(process.cwd(), fileUrl),
        path_1.default.join(__dirname, '../../', fileUrl),
        path_1.default.join(__dirname, '../../../', fileUrl),
    ];
    return candidates.find((candidate) => fs_1.default.existsSync(candidate)) || null;
}
function interpolate(html, vars) {
    return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}
async function sendMail(options) {
    let subject = options.subject;
    let html = options.html || '';
    if (options.templateKey) {
        try {
            const { commsModel } = await Promise.resolve().then(() => __importStar(require('../modules/comms/comms.model')));
            const template = await commsModel.getTemplate(options.templateKey);
            if (template) {
                subject = interpolate(template.subject, options.vars || {});
                html = interpolate(template.html, options.vars || {});
            }
        }
        catch {
            // templates table may not exist yet
        }
    }
    const mailer = getTransporter();
    const recipient = options.to || 'n/a';
    const log = async (status, error) => {
        try {
            const { commsModel } = await Promise.resolve().then(() => __importStar(require('../modules/comms/comms.model')));
            await commsModel.log({
                template_key: options.templateKey || null,
                recipient,
                subject,
                status,
                error: error || null,
            });
        }
        catch {
            // ignore log failures
        }
    };
    if (!mailer) {
        logger_1.logger.info(`Email skipped (SMTP not configured): ${subject} -> ${recipient}`);
        await log('skipped', 'SMTP not configured');
        return;
    }
    if (!options.to) {
        logger_1.logger.warn(`Email skipped (no recipient): ${subject}`);
        await log('skipped', 'No recipient');
        return;
    }
    try {
        await mailer.sendMail({
            from: env_1.env.FROM_EMAIL || env_1.env.SMTP_USER,
            to: options.to,
            subject,
            html,
            attachments: options.attachments,
        });
        logger_1.logger.info(`Email sent: ${subject} -> ${options.to}`);
        await log('sent');
    }
    catch (error) {
        logger_1.logger.error(`Email failed: ${subject} -> ${options.to}`, error?.message || error);
        await log('failed', error?.message || String(error));
    }
}
function donorName(donation) {
    return donation.guest_name || donation.donor_name || 'Friend';
}
function donorEmail(donation) {
    return donation.guest_email || donation.donor_email;
}
exports.mailService = {
    async sendDonationReceived(donation) {
        const name = donorName(donation);
        const amount = Number(donation.amount || 0).toLocaleString('en-IN');
        await sendMail({
            to: donorEmail(donation),
            subject: 'We received your donation — KNT World Welfare Foundation',
            templateKey: 'donation_received',
            vars: {
                name,
                amount,
                campaign: donation.campaign_title ? ` towards <strong>${donation.campaign_title}</strong>` : '',
                id: String(donation.id),
            },
            html: `
        <p>Dear ${name},</p>
        <p>Thank you for donating <strong>INR ${amount}</strong>${donation.campaign_title ? ` towards <strong>${donation.campaign_title}</strong>` : ''}.</p>
        <p>Your payment is under verification. We will email your receipt once our team confirms the transfer.</p>
        <p>Reference: ${donation.id}</p>
        <p>With gratitude,<br/>KNT World Welfare Foundation</p>
      `,
        });
    },
    async sendDonationVerified(donation, receiptUrl) {
        const name = donorName(donation);
        const amount = Number(donation.amount || 0).toLocaleString('en-IN');
        const receiptPath = resolveUploadPath(receiptUrl);
        await sendMail({
            to: donorEmail(donation),
            subject: 'Donation verified — your receipt is ready',
            templateKey: 'donation_verified',
            vars: { name, amount, id: String(donation.id) },
            html: `
        <p>Dear ${name},</p>
        <p>Your donation of <strong>INR ${amount}</strong> has been verified.</p>
        <p>${receiptPath ? 'Your receipt is attached to this email.' : 'You can download your receipt from your donor dashboard once you sign in.'}</p>
        <p>Thank you for supporting our work.</p>
        <p>KNT World Welfare Foundation</p>
      `,
            attachments: receiptPath
                ? [{ filename: 'donation-receipt.pdf', path: receiptPath }]
                : undefined,
        });
    },
    async sendEnquiryAlert(enquiry) {
        await sendMail({
            to: env_1.env.ADMIN_EMAIL,
            subject: `New enquiry from ${enquiry.name}`,
            templateKey: 'enquiry_alert',
            vars: {
                name: enquiry.name,
                email: enquiry.email,
                phone: enquiry.phone || 'N/A',
                message: enquiry.message || '',
            },
            html: `
        <p>A new contact enquiry was submitted.</p>
        <p><strong>Name:</strong> ${enquiry.name}<br/>
        <strong>Email:</strong> ${enquiry.email}<br/>
        <strong>Phone:</strong> ${enquiry.phone || 'N/A'}</p>
        <p>${enquiry.message}</p>
      `,
        });
    },
    async sendJobApplicationAlert(application) {
        await sendMail({
            to: env_1.env.ADMIN_EMAIL,
            subject: `New job application: ${application.name}`,
            templateKey: 'job_application_alert',
            vars: {
                name: application.name,
                job_title: application.job_title || '',
                email: application.email,
                phone: application.phone || '',
            },
            html: `
        <p>A new job application was submitted.</p>
        <p><strong>Position:</strong> ${application.job_title}<br/>
        <strong>Name:</strong> ${application.name}<br/>
        <strong>Email:</strong> ${application.email}<br/>
        <strong>Phone:</strong> ${application.phone}</p>
        <p>Review it in the admin panel under Job Applications.</p>
      `,
        });
    },
    async sendAnnualStatement(donor, fy, pdfUrl, total) {
        const receiptPath = resolveUploadPath(pdfUrl);
        await sendMail({
            to: donor.email,
            subject: `Annual donation statement ${fy} — KNT World Welfare Foundation`,
            html: `
        <p>Dear ${donor.name || 'Friend'},</p>
        <p>Please find attached your annual donation statement for FY ${fy}.</p>
        <p>Total verified giving: <strong>INR ${Number(total || 0).toLocaleString('en-IN')}</strong>.</p>
        <p>KNT World Welfare Foundation</p>
      `,
            attachments: receiptPath ? [{ filename: `annual-statement-FY${fy}.pdf`, path: receiptPath }] : undefined,
        });
    },
    async sendMembershipApproved(member, tempPassword, clientUrl) {
        await sendMail({
            to: member.email,
            subject: 'Membership approved — KNT World Welfare Foundation',
            html: `
        <p>Dear ${member.name},</p>
        <p>Your ${member.membership_type} membership is active. Member no: <strong>${member.member_no}</strong>.</p>
        ${tempPassword ? `<p>Portal login: ${member.email}<br/>Temporary password: <strong>${tempPassword}</strong></p>` : '<p>Sign in with your existing account to open the member portal.</p>'}
        <p>Portal: <a href="${clientUrl}/portal">${clientUrl}/portal</a></p>
        <p>KNT World Welfare Foundation</p>
      `,
        });
    },
    async sendMembershipExpiryReminder(member, clientUrl) {
        await sendMail({
            to: member.email,
            subject: `Membership expires on ${member.expires_at} — renew now`,
            html: `
        <p>Dear ${member.name},</p>
        <p>Your membership ${member.member_no} expires on <strong>${member.expires_at}</strong>.</p>
        <p><a href="${clientUrl}/portal">Renew from the member portal</a>.</p>
      `,
        });
    },
    async sendVolunteerApproved(volunteer, tempPassword, clientUrl) {
        await sendMail({
            to: volunteer.email,
            subject: 'Volunteer application approved',
            html: `
        <p>Dear ${volunteer.name},</p>
        <p>You are now a KNT volunteer (${volunteer.volunteer_no}).</p>
        ${tempPassword ? `<p>Login: ${volunteer.email}<br/>Temporary password: <strong>${tempPassword}</strong></p>` : ''}
        <p>Portal: <a href="${clientUrl}/portal">${clientUrl}/portal</a></p>
      `,
        });
    },
    async sendEmployeeWelcome(employee, tempPassword, clientUrl) {
        await sendMail({
            to: employee.email,
            subject: 'Welcome to KNT World Welfare Foundation',
            html: `
        <p>Dear ${employee.name},</p>
        <p>You have been onboarded as ${employee.designation} (${employee.employee_no}).</p>
        ${tempPassword ? `<p>Staff portal login: ${employee.email}<br/>Temporary password: <strong>${tempPassword}</strong></p>` : ''}
        <p>Mark attendance, apply leave, and download your welcome kit at <a href="${clientUrl}/portal">${clientUrl}/portal</a>.</p>
      `,
        });
    },
    async sendOfficialLetter(letter, clientUrl) {
        const pdfPath = resolveUploadPath(letter.pdf_url);
        await sendMail({
            to: letter.addressee_email,
            subject: letter.subject || `Letter ${letter.letter_no}`,
            html: `
        <p>Dear ${letter.addressee_name},</p>
        <p>Please find an official letter from KNT World Welfare Foundation.</p>
        <p>Letter no: <strong>${letter.letter_no}</strong></p>
        <p>Verify: <a href="${clientUrl}/verify/${letter.verify_code}">${clientUrl}/verify/${letter.verify_code}</a></p>
      `,
            attachments: pdfPath ? [{ filename: `${letter.letter_no}.pdf`, path: pdfPath }] : undefined,
        });
    },
    async sendPasswordReset(email, resetUrl) {
        await sendMail({
            to: email,
            subject: 'Reset your password — KNT World Welfare Foundation',
            templateKey: 'password_reset',
            vars: { resetUrl },
        });
    },
    async sendEmailVerify(name, email, verifyUrl) {
        await sendMail({
            to: email,
            subject: 'Verify your email — KNT World Welfare Foundation',
            templateKey: 'email_verify',
            vars: { name, verifyUrl },
            html: `
        <p>Dear ${name},</p>
        <p>Please <a href="${verifyUrl}">verify your email</a> to activate your account.</p>
      `,
        });
    },
};
