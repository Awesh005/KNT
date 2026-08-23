import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';

export type EightyGFields = {
  donorName: string;
  amount: number;
  purpose: string;
  certificateNo: string;
  date: string;
};

// PDF: origin bottom-left. Page 841.89 × 595.28 pt (A4 landscape).
// Values are drawn on top of the template — no white background boxes.
// Template already prints labels: "Certificate No.:", "Date:", "INR", etc.
const LAYOUT = {
  pageCenterX: 421,
  certificateNo: { x: 144, y: 327 },
  date: { x: 662, y: 327 },
  donorName: { y: 256 },
  amount: { y: 196 },
  purpose: { y: 138 },
};

function resolveTemplatePath(): string {
  const candidates = [
    path.join(process.cwd(), 'uploads/80g_certificates/certificate.pdf'),
    path.join(__dirname, '../../../uploads/80g_certificates/certificate.pdf'),
    path.join(__dirname, '../../uploads/80g_certificates/certificate.pdf'),
  ];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error('80G certificate template not found at uploads/80g_certificates/certificate.pdf');
  }
  return found;
}

function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  centerX: number,
  y: number,
  size: number
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: centerX - width / 2,
    y,
    size,
    font,
    color: rgb(0.12, 0.12, 0.12),
  });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines.slice(0, 2);
}

export async function generateEightyGCertificatePdf(fields: EightyGFields): Promise<Buffer> {
  const templateBytes = fs.readFileSync(resolveTemplatePath());
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPages()[0];
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(fields.certificateNo, {
    x: LAYOUT.certificateNo.x,
    y: LAYOUT.certificateNo.y,
    size: 11,
    font: boldFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText(fields.date, {
    x: LAYOUT.date.x,
    y: LAYOUT.date.y,
    size: 11,
    font: regularFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  drawCenteredText(page, boldFont, fields.donorName.toUpperCase(), LAYOUT.pageCenterX, LAYOUT.donorName.y, 13);

  // Template already shows "INR" — only draw the amount on the underscore line
  const amountText = Number(fields.amount).toLocaleString('en-IN');
  drawCenteredText(page, boldFont, amountText, LAYOUT.pageCenterX, LAYOUT.amount.y, 12);

  const purposeLines = wrapText(fields.purpose, regularFont, 11, 460);
  purposeLines.forEach((line, index) => {
    drawCenteredText(page, regularFont, line, LAYOUT.pageCenterX, LAYOUT.purpose.y - index * 14, 11);
  });

  return Buffer.from(await pdfDoc.save());
}

export function buildCertificateNumber(): string {
  const year = new Date().getFullYear();
  const suffix = String(Date.now()).slice(-8);
  return `KNT/80G/${year}/${suffix}`;
}

export function formatCertificateDate(dateInput?: string | Date): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
