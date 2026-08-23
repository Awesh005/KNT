"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.peoplePdf = void 0;
exports.formatCardDate = formatCardDate;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const qrcode_1 = __importDefault(require("qrcode"));
const env_1 = require("../../config/env");
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
function logoPath() {
    const candidates = [
        path_1.default.join(process.cwd(), '../frontend/public/KNT-Logo.png'),
        path_1.default.join(process.cwd(), 'public/KNT-Logo.png'),
        path_1.default.join(process.cwd(), '../public/KNT-Logo.png'),
    ];
    return candidates.find((p) => fs_1.default.existsSync(p));
}
async function writePdf(docDefinition, folder, fileName) {
    const dir = path_1.default.join(process.cwd(), 'uploads', folder);
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
    return `/uploads/${folder}/${fileName}`;
}
async function qrDataUrl(text) {
    return qrcode_1.default.toDataURL(text, { margin: 1, width: 180 });
}
function formatCardDate(value) {
    if (!value)
        return 'lifetime';
    const d = new Date(value);
    if (Number.isNaN(d.getTime()))
        return String(value).slice(0, 10);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function publicSiteUrl() {
    return String(env_1.env.CLIENT_URL || '').replace(/\/$/, '');
}
function photoAbs(url) {
    if (!url)
        return null;
    const abs = path_1.default.join(process.cwd(), url.replace(/^\//, ''));
    return fs_1.default.existsSync(abs) ? abs : null;
}
exports.peoplePdf = {
    async idCard(person) {
        const verifyUrl = `${publicSiteUrl()}${person.verifyPath.startsWith('/') ? person.verifyPath : `/${person.verifyPath}`}`;
        const qr = await qrDataUrl(verifyUrl);
        const logo = logoPath();
        const photo = photoAbs(person.photo_url);
        const content = [
            {
                columns: [
                    logo ? { image: logo, width: 42 } : { text: 'KNT', bold: true, color: '#1B4D3E' },
                    {
                        stack: [
                            { text: 'KNT WORLD WELFARE FOUNDATION', bold: true, fontSize: 11, color: '#1B4D3E' },
                            { text: person.roleLabel.toUpperCase(), fontSize: 8, color: '#888888' },
                        ],
                        margin: [8, 4, 0, 0],
                    },
                ],
            },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: 360, y2: 8, lineWidth: 1, lineColor: '#C9A227' }] },
            {
                columns: [
                    photo
                        ? { image: photo, width: 72, height: 90, cover: { width: 72, height: 90 } }
                        : { text: 'PHOTO', alignment: 'center', margin: [0, 30, 0, 0], color: '#999' },
                    {
                        stack: [
                            { text: person.name, bold: true, fontSize: 13, margin: [0, 0, 0, 6] },
                            { text: person.number, fontSize: 10 },
                            { text: person.extra, fontSize: 9, margin: [0, 4, 0, 0], color: '#555' },
                        ],
                        margin: [12, 4, 0, 0],
                        width: '*',
                    },
                    {
                        stack: [
                            { image: qr, width: 72 },
                            { text: 'Scan to verify', fontSize: 7, color: '#888', alignment: 'center', margin: [0, 4, 0, 0] },
                        ],
                        width: 80,
                    },
                ],
                margin: [0, 12, 0, 0],
            },
        ];
        return writePdf({
            pageSize: { width: 400, height: 250 },
            pageMargins: [16, 16, 16, 16],
            defaultStyle: { font: 'Helvetica' },
            content,
        }, 'people', `id-${person.number}.pdf`);
    },
    async membershipCertificate(member) {
        const logo = logoPath();
        return writePdf({
            pageSize: 'A4',
            pageMargins: [48, 48, 48, 48],
            defaultStyle: { font: 'Helvetica', color: '#333' },
            content: [
                logo ? { image: logo, width: 80, alignment: 'center' } : {},
                { text: 'KNT WORLD WELFARE FOUNDATION', alignment: 'center', bold: true, fontSize: 16, color: '#1B4D3E', margin: [0, 12, 0, 4] },
                { text: 'MEMBERSHIP CERTIFICATE', alignment: 'center', fontSize: 12, color: '#888', margin: [0, 0, 0, 24] },
                { text: 'This is to certify that', alignment: 'center' },
                { text: member.name, alignment: 'center', bold: true, fontSize: 18, margin: [0, 10, 0, 10] },
                {
                    text: `is enrolled as a ${member.membership_type} member (No. ${member.member_no}) of KNT World Welfare Foundation.`,
                    alignment: 'center',
                    margin: [24, 0, 24, 16],
                },
                { text: `Valid from ${formatCardDate(member.started_at)} to ${formatCardDate(member.expires_at)}.`, alignment: 'center', margin: [0, 0, 0, 40] },
                { text: 'Authorized Signatory', alignment: 'right', bold: true },
            ],
        }, 'people', `certificate-${member.member_no}.pdf`);
    },
    async membershipReceipt(member, receiptNo, fy) {
        return writePdf({
            pageSize: 'A5',
            pageMargins: [28, 28, 28, 28],
            defaultStyle: { font: 'Helvetica' },
            content: [
                { text: 'KNT WORLD WELFARE FOUNDATION', bold: true, color: '#1B4D3E', alignment: 'center' },
                { text: 'MEMBERSHIP FEE RECEIPT', alignment: 'center', margin: [0, 4, 0, 16] },
                { text: `Receipt: ${receiptNo}` },
                { text: `Member: ${member.name}` },
                { text: `No: ${member.member_no}` },
                { text: `Type: ${member.membership_type}` },
                { text: `FY: ${fy}` },
                { text: `Amount: INR ${Number(member.fee).toLocaleString('en-IN')}`, bold: true, margin: [0, 8, 0, 0] },
            ],
        }, 'people', `${receiptNo.replace(/\//g, '-')}.pdf`);
    },
    async welcomeKit(employee) {
        return writePdf({
            pageSize: 'A4',
            pageMargins: [48, 48, 48, 48],
            defaultStyle: { font: 'Helvetica', color: '#333' },
            content: [
                { text: 'KNT WORLD WELFARE FOUNDATION', bold: true, color: '#1B4D3E', alignment: 'center' },
                { text: 'EMPLOYEE WELCOME KIT', alignment: 'center', margin: [0, 6, 0, 20] },
                { text: `Dear ${employee.name},`, margin: [0, 0, 0, 8] },
                { text: `Welcome to the team as ${employee.designation || 'staff'} (${employee.employee_no}).`, margin: [0, 0, 0, 16] },
                { text: 'Joining checklist', bold: true, margin: [0, 0, 0, 8] },
                {
                    ul: [
                        'Sign the appointment / joining form',
                        'Submit KYC copies (Aadhaar, PAN, bank details)',
                        'Read HR policies and code of conduct',
                        'Collect ID card and email access',
                        'Mark first-day attendance in the staff portal',
                        'Complete welcome briefing with reporting manager',
                    ],
                },
                { text: 'You can download this kit, apply for leave, and mark attendance from the staff portal.', margin: [0, 20, 0, 0] },
            ],
        }, 'people', `welcome-${employee.employee_no}.pdf`);
    },
};
