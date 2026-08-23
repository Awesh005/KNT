"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEightyGCertificatePdf = generateEightyGCertificatePdf;
exports.buildCertificateNumber = buildCertificateNumber;
exports.formatCertificateDate = formatCertificateDate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
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
function resolveTemplatePath() {
    const candidates = [
        path_1.default.join(process.cwd(), 'uploads/80g_certificates/certificate.pdf'),
        path_1.default.join(__dirname, '../../../uploads/80g_certificates/certificate.pdf'),
        path_1.default.join(__dirname, '../../uploads/80g_certificates/certificate.pdf'),
    ];
    const found = candidates.find((candidate) => fs_1.default.existsSync(candidate));
    if (!found) {
        throw new Error('80G certificate template not found at uploads/80g_certificates/certificate.pdf');
    }
    return found;
}
function drawCenteredText(page, font, text, centerX, y, size) {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
        x: centerX - width / 2,
        y,
        size,
        font,
        color: (0, pdf_lib_1.rgb)(0.12, 0.12, 0.12),
    });
}
function wrapText(text, font, size, maxWidth) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0)
        return [''];
    const lines = [];
    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
        const next = `${current} ${words[i]}`;
        if (font.widthOfTextAtSize(next, size) <= maxWidth) {
            current = next;
        }
        else {
            lines.push(current);
            current = words[i];
        }
    }
    lines.push(current);
    return lines.slice(0, 2);
}
async function generateEightyGCertificatePdf(fields) {
    const templateBytes = fs_1.default.readFileSync(resolveTemplatePath());
    const pdfDoc = await pdf_lib_1.PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const boldFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
    page.drawText(fields.certificateNo, {
        x: LAYOUT.certificateNo.x,
        y: LAYOUT.certificateNo.y,
        size: 11,
        font: boldFont,
        color: (0, pdf_lib_1.rgb)(0.12, 0.12, 0.12),
    });
    page.drawText(fields.date, {
        x: LAYOUT.date.x,
        y: LAYOUT.date.y,
        size: 11,
        font: regularFont,
        color: (0, pdf_lib_1.rgb)(0.12, 0.12, 0.12),
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
function buildCertificateNumber() {
    const year = new Date().getFullYear();
    const suffix = String(Date.now()).slice(-8);
    return `KNT/80G/${year}/${suffix}`;
}
function formatCertificateDate(dateInput) {
    const date = dateInput ? new Date(dateInput) : new Date();
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
