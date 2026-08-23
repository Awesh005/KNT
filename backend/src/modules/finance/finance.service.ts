import fs from 'fs';
import path from 'path';
import { financeModel } from './finance.model';
import { ValidationError, NotFoundError } from '../../utils/errors';
import { getIndianFY, getFyRange } from '../../utils/fy';

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

function toCsv(rows: any[], columns: Array<{ key: string; label: string }>) {
  const header = columns.map((col) => `"${col.label}"`).join(',');
  const body = rows.map((row) =>
    columns.map((col) => `"${String(row[col.key] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  return [header, ...body].join('\n');
}

export const financeService = {
  getRegister(query: any) {
    return financeModel.getRegister({
      from: query.from,
      to: query.to,
      status: query.status || 'verified',
    });
  },

  async exportRegisterCsv(query: any) {
    const rows = await this.getRegister(query);
    return toCsv(rows, [
      { key: 'donated_at', label: 'Date' },
      { key: 'donor_name', label: 'Donor' },
      { key: 'donor_email', label: 'Email' },
      { key: 'guest_pan', label: 'PAN' },
      { key: 'campaign_title', label: 'Campaign' },
      { key: 'payment_mode', label: 'Mode' },
      { key: 'amount', label: 'Amount' },
      { key: 'receipt_no', label: 'Receipt No' },
      { key: 'certificate_no', label: '80G No' },
      { key: 'status', label: 'Status' },
    ]);
  },

  getHeads() {
    return financeModel.getHeads();
  },

  createHead(data: any) {
    if (!data.name || !data.type) throw new ValidationError('Name and type are required');
    return financeModel.createHead(data);
  },

  getExpenses(query: any) {
    return financeModel.getExpenses(query);
  },

  async createExpense(data: any, userId?: string) {
    if (!data.head_id || !data.amount || !data.expense_date) {
      throw new ValidationError('Head, amount and date are required');
    }
    const id = await financeModel.createExpense({ ...data, created_by: userId });
    const expenses = await financeModel.getExpenses({});
    return expenses.find((row) => row.id === id);
  },

  async deleteExpense(id: number) {
    const ok = await financeModel.deleteExpense(id);
    if (!ok) throw new NotFoundError('Expense not found');
  },

  getBudgets(fy?: string) {
    return financeModel.getBudgets(fy);
  },

  async createBudget(data: any) {
    if (!data.title || data.allocated == null) throw new ValidationError('Title and allocated amount are required');
    const id = await financeModel.createBudget({ ...data, fy: data.fy || getIndianFY() });
    const budgets = await financeModel.getBudgets(data.fy);
    return budgets.find((row) => row.id === id);
  },

  async deleteBudget(id: number) {
    const ok = await financeModel.deleteBudget(id);
    if (!ok) throw new NotFoundError('Budget not found');
  },

  getDashboard(fy?: string) {
    return financeModel.getDashboard(fy);
  },

  async exportAuditCsv(query: any) {
    const from = query.from || getFyRange(query.fy || getIndianFY()).from;
    const to = query.to || getFyRange(query.fy || getIndianFY()).to;
    const pack = await financeModel.getAuditPack(from, to);
    const donationCsv = toCsv(pack.donations, [
      { key: 'donated_at', label: 'Date' },
      { key: 'donor_name', label: 'Donor' },
      { key: 'guest_pan', label: 'PAN' },
      { key: 'campaign_title', label: 'Campaign' },
      { key: 'amount', label: 'Amount' },
      { key: 'receipt_no', label: 'Receipt' },
      { key: 'certificate_no', label: '80G' },
    ]);
    const payoutCsv = toCsv(pack.payouts as any[], [
      { key: 'transfer_date', label: 'Date' },
      { key: 'campaign_title', label: 'Campaign' },
      { key: 'transferred_to', label: 'Paid to' },
      { key: 'amount', label: 'Amount' },
    ]);
    const expenseCsv = toCsv(pack.expenses, [
      { key: 'expense_date', label: 'Date' },
      { key: 'head_name', label: 'Head' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount' },
      { key: 'voucher_no', label: 'Voucher' },
    ]);
    return { from, to, donationCsv, payoutCsv, expenseCsv, pack };
  },

  async generateUtilizationPdf(query: any) {
    const data = await financeModel.getUtilization({
      campaign_id: query.campaign_id ? Number(query.campaign_id) : undefined,
      fy: query.fy,
    });
    const { label } = getFyRange(data.fy);
    const docDefinition: any = {
      defaultStyle: { font: 'Helvetica', color: '#333333' },
      content: [
        { text: 'KNT WORLD WELFARE FOUNDATION', style: 'header', alignment: 'center' },
        { text: 'UTILIZATION CERTIFICATE', style: 'subheader', alignment: 'center', margin: [0, 6, 0, 18] },
        { text: data.title, bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
        { text: label, alignment: 'center', margin: [0, 0, 0, 20] },
        {
          table: {
            widths: ['70%', '30%'],
            body: [
              ['Funds received (verified donations)', `INR ${data.received.toLocaleString('en-IN')}`],
              ['Campaign payouts', `INR ${data.payouts.toLocaleString('en-IN')}`],
              ['Other expenses', `INR ${data.expenses.toLocaleString('en-IN')}`],
              [{ text: 'Total utilized', bold: true }, { text: `INR ${data.utilized.toLocaleString('en-IN')}`, bold: true }],
              ['Unspent / remaining', `INR ${data.unspent.toLocaleString('en-IN')}`],
            ],
          },
        },
        {
          text: 'Certified that the amounts stated above have been applied towards the stated charitable objects of the foundation, based on books of account for the period.',
          margin: [0, 24, 0, 40],
          italics: true,
        },
        { text: 'Authorized Signatory', alignment: 'right', bold: true },
        { text: 'KNT World Welfare Foundation', alignment: 'right', fontSize: 9 },
      ],
      styles: {
        header: { fontSize: 16, bold: true, color: '#1B4D3E' },
        subheader: { fontSize: 12, bold: true, color: '#666666' },
      },
    };

    const dir = path.join(process.cwd(), 'uploads/finance');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `UC-${data.fy}-${Date.now()}.pdf`;
    const filePath = path.join(dir, fileName);
    const pdfDoc = await printer.createPdfKitDocument(docDefinition);
    await new Promise<void>((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
    return { ...data, pdfUrl: `/uploads/finance/${fileName}` };
  },
};
