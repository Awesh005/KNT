"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const PdfPrinter = require('pdfmake/js/Printer').default;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const errors_1 = require("../../utils/errors");
const document_model_1 = require("./document.model");
const donation_service_1 = require("../donations/donation.service");
const cms_model_1 = require("../cms/cms.model");
const org_1 = require("../../config/org");
const eighty_g_certificate_generator_1 = require("./eighty-g-certificate.generator");
// Basic fonts for pdfmake (using standard Helvetica instead of custom fonts to avoid file system dependency issues if fonts aren't downloaded)
const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};
const dummyUrlResolver = {
    resolve: () => { },
    resolved: () => Promise.resolve()
};
const printer = new PdfPrinter(fonts, null, dummyUrlResolver);
function getAssetPath(filename) {
    const candidates = [
        path_1.default.join(process.cwd(), 'public', filename),
        path_1.default.join(process.cwd(), filename),
        path_1.default.join(__dirname, '../public', filename),
        path_1.default.join(__dirname, '../../public', filename),
        path_1.default.join(__dirname, '../../../public', filename),
        path_1.default.join(__dirname, '../../../../frontend/public', filename),
    ];
    for (const p of candidates) {
        if (fs_1.default.existsSync(p))
            return p;
    }
    return null;
}
exports.documentService = {
    async generateReceipt(donationId) {
        // 1. Check if receipt already exists
        const existing = await document_model_1.documentModel.getReceiptByDonationId(donationId);
        if (existing)
            return existing;
        // 2. Fetch donation details
        const donation = await donation_service_1.donationService.getDonationById(donationId);
        if (donation.status !== 'verified') {
            throw new errors_1.AppError('Cannot generate receipt for unverified donation', 400);
        }
        // Fetch org details from CMS
        let regNo80G = org_1.ORG.itUrn;
        let csrNo = org_1.ORG.csr;
        let orgPan = org_1.ORG.pan;
        let orgCin = org_1.ORG.cin;
        let orgName = org_1.ORG.name;
        let registeredOffice = org_1.ORG.address;
        try {
            const aboutContent = await cms_model_1.cmsModel.getContent('about', 'main');
            if (aboutContent?.content?.companyDetails) {
                const details = aboutContent.content.companyDetails;
                orgName = (0, org_1.cmsDetail)(details, 'ORGANIZATION NAME', orgName);
                registeredOffice = (0, org_1.cmsDetail)(details, 'REGISTERED OFFICE', registeredOffice);
                orgPan = (0, org_1.cmsDetail)(details, 'PAN', orgPan);
                orgCin = (0, org_1.cmsDetail)(details, 'CIN', orgCin);
                csrNo = (0, org_1.cmsDetail)(details, 'CSR REG. NO.', csrNo);
                regNo80G =
                    (0, org_1.cmsDetail)(details, '80G / IT URN', '') ||
                        (0, org_1.cmsDetail)(details, '80G REG. NO.', '') ||
                        regNo80G;
            }
        }
        catch (e) {
            console.error('Error fetching CMS content for receipt', e);
        }
        const receiptNo = await document_model_1.documentModel.nextReceiptNumber();
        const logoFile = getAssetPath('KNT-Logo.png');
        const signatureFile = getAssetPath('signature.png');
        const content = [];
        if (logoFile) {
            content.push({
                image: logoFile,
                width: 120,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            });
        }
        content.push({ text: orgName.toUpperCase(), style: 'header', alignment: 'center' }, registeredOffice ? { text: registeredOffice, alignment: 'center', fontSize: 9, margin: [40, 0, 40, 8], color: '#555555' } : { text: '', margin: [0, 0, 0, 0] }, { text: 'DONATION RECEIPT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] }, {
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 1,
                widths: ['40%', '60%'],
                body: [
                    [{ text: 'RECEIPT DETAILS', colSpan: 2, style: 'tableHeader', alignment: 'center' }, ''],
                    ['Receipt No:', { text: receiptNo, bold: true }],
                    ['Date:', new Date(donation.donated_at || Date.now()).toLocaleDateString('en-IN')],
                    ['Donor Name:', { text: donation.donor_name || 'Anonymous', bold: true }],
                    ['Email:', donation.donor_email || 'N/A'],
                    ['PAN:', donation.guest_pan || 'N/A'],
                    ['Address:', [donation.guest_address, donation.guest_city, donation.guest_state, donation.guest_pincode].filter(Boolean).join(', ') || 'N/A'],
                    ['Campaign:', donation.campaign_title || 'General Donation'],
                    ['Mode:', donation.payment_mode || 'UPI'],
                    ['Donation Amount:', { text: `INR ${Number(donation.amount).toLocaleString('en-IN')}`, bold: true, color: '#1B4D3E' }],
                    ['Transaction Ref:', donation.payment_ref || 'N/A'],
                    ['Foundation PAN:', orgPan],
                    ['CIN:', orgCin],
                    ['CSR Reg No:', csrNo],
                    ['80G / IT URN:', regNo80G || 'N/A'],
                ]
            }
        }, { text: 'This receipt is issued for a donation received towards charitable objects of the foundation.', margin: [0, 24, 0, 8], alignment: 'center', italics: true, fontSize: 9 });
        if (signatureFile) {
            content.push({
                image: signatureFile,
                width: 100,
                alignment: 'right',
                margin: [0, 20, 20, 0]
            });
        }
        content.push({ text: 'Kanhaiya Lal', alignment: 'right', margin: [0, 5, 15, 0], bold: true, fontSize: 12 }, { text: 'Founder / Authorized Signatory', alignment: 'right', margin: [0, 2, 15, 0], color: '#666666', fontSize: 10 });
        const docDefinition = {
            defaultStyle: { font: 'Helvetica', color: '#333333' },
            content,
            styles: {
                header: { fontSize: 20, bold: true, color: '#1B4D3E' },
                subheader: { fontSize: 12, bold: true, color: '#666666', tracking: 1 },
                tableHeader: { bold: true, fontSize: 12, color: 'white', fillColor: '#1B4D3E', margin: [0, 4, 0, 4] }
            }
        };
        // 4. Generate PDF buffer
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        // Instead of streaming to a file directly, we can store it in the uploads folder
        const uploadsDir = path_1.default.join(__dirname, '../../../uploads/receipts');
        if (!fs_1.default.existsSync(uploadsDir))
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const fileName = `${receiptNo.replace(/\//g, '-')}.pdf`;
        const filePath = path_1.default.join(uploadsDir, fileName);
        await new Promise((resolve, reject) => {
            const stream = fs_1.default.createWriteStream(filePath);
            pdfDoc.pipe(stream);
            pdfDoc.end();
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        // 5. Save to database
        const id = 'DOC-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        const pdfUrl = `/uploads/receipts/${fileName}`;
        await document_model_1.documentModel.saveReceipt(id, donationId, receiptNo, pdfUrl);
        return await document_model_1.documentModel.getReceiptByDonationId(donationId);
    },
    async generate80G(donationId, options) {
        const existing = await document_model_1.documentModel.get80GCertificateByDonationId(donationId);
        if (existing && !options?.regenerate) {
            return existing;
        }
        if (existing && options?.regenerate) {
            const oldPath = existing.pdf_url?.replace(/^\//, '');
            const candidates = [
                path_1.default.join(process.cwd(), oldPath),
                path_1.default.join(__dirname, '../../../', oldPath),
            ];
            for (const filePath of candidates) {
                if (filePath && fs_1.default.existsSync(filePath)) {
                    try {
                        fs_1.default.unlinkSync(filePath);
                    }
                    catch { /* ignore */ }
                }
            }
            await document_model_1.documentModel.delete80GCertificateByDonationId(donationId);
        }
        const donation = await donation_service_1.donationService.getDonationById(donationId);
        if (donation.status !== 'verified') {
            throw new errors_1.AppError('Cannot generate 80G for unverified donation', 400);
        }
        const donorName = donation.donor_name || donation.guest_name || 'Donor';
        const purpose = donation.campaign_title || 'General Welfare & Humanitarian Service';
        const certNo = (0, eighty_g_certificate_generator_1.buildCertificateNumber)();
        const donatedAt = donation.donated_at || donation.created_at;
        const pdfBuffer = await (0, eighty_g_certificate_generator_1.generateEightyGCertificatePdf)({
            donorName,
            amount: Number(donation.amount),
            purpose,
            certificateNo: certNo,
            date: (0, eighty_g_certificate_generator_1.formatCertificateDate)(donatedAt),
        });
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads/certificates');
        if (!fs_1.default.existsSync(uploadsDir))
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const safeFileName = certNo.replace(/\//g, '-');
        const fileName = `${safeFileName}.pdf`;
        const filePath = path_1.default.join(uploadsDir, fileName);
        fs_1.default.writeFileSync(filePath, pdfBuffer);
        const id = 'DOC-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        const pdfUrl = `/uploads/certificates/${fileName}`;
        await document_model_1.documentModel.save80GCertificate(id, donationId, certNo, pdfUrl);
        return await document_model_1.documentModel.get80GCertificateByDonationId(donationId);
    },
};
