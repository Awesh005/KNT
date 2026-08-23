import fs from 'fs';
import path from 'path';
import { donorModel } from './donor.model';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { getIndianFY, getFyRange, normalizeDonorKey } from '../../utils/fy';
import { mailService } from '../../services/mail.service';

const PdfPrinter = require('pdfmake/js/Printer').default;

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};
const printer = new PdfPrinter(fonts, null, { resolve: () => {}, resolved: () => Promise.resolve() });

async function writePdf(docDefinition: any, dir: string, fileName: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  const pdfDoc = await printer.createPdfKitDocument(docDefinition);
  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    pdfDoc.pipe(stream);
    pdfDoc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  return filePath;
}

export const donorService = {
  async listDonors(query: any) {
    return donorModel.listDonors({
      search: query.search,
      tag: query.tag,
      fy: query.fy,
    });
  },

  async getDonor(donorKey: string) {
    const profile = await donorModel.getDonorProfile(decodeURIComponent(donorKey));
    if (!profile) throw new NotFoundError('Donor not found');
    return profile;
  },

  async addNote(donorKey: string, data: any, user: { id?: string; name?: string }) {
    if (!data.note?.trim()) throw new ValidationError('Note is required');
    await donorModel.addNote(decodeURIComponent(donorKey), {
      note: data.note.trim(),
      author_id: user.id,
      author_name: user.name,
      follow_up_at: data.follow_up_at || null,
    });
    return this.getDonor(donorKey);
  },

  async setTags(donorKey: string, tags: string[]) {
    await donorModel.setTags(decodeURIComponent(donorKey), Array.isArray(tags) ? tags : []);
    return this.getDonor(donorKey);
  },

  async exportCsv(query: any) {
    const donors = await this.listDonors(query);
    const header = ['Name', 'Email', 'Phone', 'PAN', 'City', 'Gifts', 'Total INR', 'Last gift', '80G', 'Tags'];
    const rows = donors.map((donor: any) => [
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

  async generateAnnualStatement(donorKey: string, fy?: string) {
    const key = decodeURIComponent(donorKey);
    const profile = await this.getDonor(key);
    const year = fy || getIndianFY();
    const gifts = await donorModel.getGiftsForFy(key, year);
    if (gifts.length === 0) {
      throw new ValidationError(`No verified donations in ${getFyRange(year).label}`);
    }

    const total = gifts.reduce((sum: number, gift: any) => sum + Number(gift.amount || 0), 0);
    const { label } = getFyRange(year);
    const docDefinition: any = {
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
              ...gifts.map((gift: any) => [
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

    const safeKey = normalizeDonorKey(profile.email).replace(/[^a-z0-9]+/g, '-');
    const fileName = `statement-${safeKey}-FY${year}.pdf`;
    await writePdf(docDefinition, path.join(process.cwd(), 'uploads/statements'), fileName);
    const pdfUrl = `/uploads/statements/${fileName}`;
    await donorModel.saveStatement(key, year, pdfUrl);
    return { ...await donorModel.getStatement(key, year), donor: profile, gifts, total, fy: year };
  },

  async emailAllStatements(fy?: string) {
    const donors = await donorModel.listDonors({ fy: fy || getIndianFY() });
    const results = [];
    for (const donor of donors) {
      try {
        const sent = await this.emailAnnualStatement(donor.donorKey, fy || getIndianFY());
        results.push({ email: donor.email, ok: true, pdfUrl: sent.pdf_url });
      } catch (error: any) {
        results.push({ email: donor.email, ok: false, error: error.message });
      }
    }
    return { fy: fy || getIndianFY(), results };
  },

  async emailAnnualStatement(donorKey: string, fy?: string) {
    const statement = await this.generateAnnualStatement(donorKey, fy);
    await mailService.sendAnnualStatement(statement.donor, statement.fy, statement.pdf_url, statement.total);
    await donorModel.markStatementEmailed(decodeURIComponent(donorKey), statement.fy);
    return { ...statement, emailed: true };
  },
};
