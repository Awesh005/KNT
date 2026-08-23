"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donorService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const donor_model_1 = require("./donor.model");
const errors_1 = require("../../utils/errors");
const fy_1 = require("../../utils/fy");
const mail_service_1 = require("../../services/mail.service");
const PdfPrinter = require('pdfmake/js/Printer').default;
const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};
const printer = new PdfPrinter(fonts, null, { resolve: () => { }, resolved: () => Promise.resolve() });
async function writePdf(docDefinition, dir, fileName) {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    const filePath = path_1.default.join(dir, fileName);
    const pdfDoc = await printer.createPdfKitDocument(docDefinition);
    await new Promise((resolve, reject) => {
        const stream = fs_1.default.createWriteStream(filePath);
        pdfDoc.pipe(stream);
        pdfDoc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
    return filePath;
}
exports.donorService = {
    async listDonors(query) {
        return donor_model_1.donorModel.listDonors({
            search: query.search,
            tag: query.tag,
            fy: query.fy,
        });
    },
    async getDonor(donorKey) {
        const profile = await donor_model_1.donorModel.getDonorProfile(decodeURIComponent(donorKey));
        if (!profile)
            throw new errors_1.NotFoundError('Donor not found');
        return profile;
    },
    async addNote(donorKey, data, user) {
        if (!data.note?.trim())
            throw new errors_1.ValidationError('Note is required');
        await donor_model_1.donorModel.addNote(decodeURIComponent(donorKey), {
            note: data.note.trim(),
            author_id: user.id,
            author_name: user.name,
            follow_up_at: data.follow_up_at || null,
        });
        return this.getDonor(donorKey);
    },
    async setTags(donorKey, tags) {
        await donor_model_1.donorModel.setTags(decodeURIComponent(donorKey), Array.isArray(tags) ? tags : []);
        return this.getDonor(donorKey);
    },
    async exportCsv(query) {
        const donors = await this.listDonors(query);
        const header = ['Name', 'Email', 'Phone', 'PAN', 'City', 'Gifts', 'Total INR', 'Last gift', '80G', 'Tags'];
        const rows = donors.map((donor) => [
            donor.name || '',
            donor.email || '',
            donor.phone || '',
            donor.pan || '',
            donor.city || '',
            donor.giftCount,
            donor.totalGiven,
            donor.lastGiftAt ? new Date(donor.lastGiftAt).toISOString().slice(0, 10) : '',
            donor.has80G ? 'Yes' : 'No',
            (donor.tags || []).join('|'),
        ]);
        return [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    },
    async generateAnnualStatement(donorKey, fy) {
        const key = decodeURIComponent(donorKey);
        const profile = await this.getDonor(key);
        const year = fy || (0, fy_1.getIndianFY)();
        const gifts = await donor_model_1.donorModel.getGiftsForFy(key, year);
        if (gifts.length === 0) {
            throw new errors_1.ValidationError(`No verified donations in ${(0, fy_1.getFyRange)(year).label}`);
        }
        const total = gifts.reduce((sum, gift) => sum + Number(gift.amount || 0), 0);
        const { label } = (0, fy_1.getFyRange)(year);
        const docDefinition = {
            defaultStyle: { font: 'Helvetica', color: '#333333' },
            content: [
                { text: 'KNT WORLD WELFARE FOUNDATION', style: 'header', alignment: 'center' },
                { text: `ANNUAL DONATION STATEMENT — ${label}`, style: 'subheader', alignment: 'center', margin: [0, 6, 0, 20] },
                { text: `Donor: ${profile.name}`, bold: true },
                { text: `Email: ${profile.email}` },
                { text: `PAN: ${profile.pan || 'Not provided'}`, margin: [0, 0, 0, 16] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['18%', '28%', '18%', '18%', '18%'],
                        body: [
                            [
                                { text: 'Date', style: 'th' },
                                { text: 'Purpose', style: 'th' },
                                { text: 'Amount', style: 'th' },
                                { text: 'Receipt', style: 'th' },
                                { text: '80G', style: 'th' },
                            ],
                            ...gifts.map((gift) => [
                                new Date(gift.donated_at).toLocaleDateString('en-IN'),
                                gift.campaign_title || 'General welfare',
                                `INR ${Number(gift.amount).toLocaleString('en-IN')}`,
                                gift.receipt_no || '—',
                                gift.certificate_no || '—',
                            ]),
                            [
                                { text: 'Total', colSpan: 2, bold: true },
                                '',
                                { text: `INR ${total.toLocaleString('en-IN')}`, bold: true },
                                '',
                                '',
                            ],
                        ],
                    },
                },
                { text: 'This statement summarises verified donations for the financial year. Keep it with your tax records.', margin: [0, 24, 0, 0], italics: true, fontSize: 9 },
            ],
            styles: {
                header: { fontSize: 16, bold: true, color: '#1B4D3E' },
                subheader: { fontSize: 11, bold: true, color: '#666666' },
                th: { bold: true, fillColor: '#1B4D3E', color: 'white', fontSize: 9 },
            },
        };
        const safeKey = (0, fy_1.normalizeDonorKey)(profile.email).replace(/[^a-z0-9]+/g, '-');
        const fileName = `statement-${safeKey}-FY${year}.pdf`;
        await writePdf(docDefinition, path_1.default.join(process.cwd(), 'uploads/statements'), fileName);
        const pdfUrl = `/uploads/statements/${fileName}`;
        await donor_model_1.donorModel.saveStatement(key, year, pdfUrl);
        return { ...await donor_model_1.donorModel.getStatement(key, year), donor: profile, gifts, total, fy: year };
    },
    async emailAllStatements(fy) {
        const donors = await donor_model_1.donorModel.listDonors({ fy: fy || (0, fy_1.getIndianFY)() });
        const results = [];
        for (const donor of donors) {
            try {
                const sent = await this.emailAnnualStatement(donor.donorKey, fy || (0, fy_1.getIndianFY)());
                results.push({ email: donor.email, ok: true, pdfUrl: sent.pdf_url });
            }
            catch (error) {
                results.push({ email: donor.email, ok: false, error: error.message });
            }
        }
        return { fy: fy || (0, fy_1.getIndianFY)(), results };
    },
    async emailAnnualStatement(donorKey, fy) {
        const statement = await this.generateAnnualStatement(donorKey, fy);
        await mail_service_1.mailService.sendAnnualStatement(statement.donor, statement.fy, statement.pdf_url, statement.total);
        await donor_model_1.donorModel.markStatementEmailed(decodeURIComponent(donorKey), statement.fy);
        return { ...statement, emailed: true };
    },
};
