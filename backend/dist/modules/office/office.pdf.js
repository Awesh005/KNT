"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLetterPdf = generateLetterPdf;
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
function asset(filename) {
    const candidates = [
        path_1.default.join(process.cwd(), 'uploads/office', filename),
        path_1.default.join(process.cwd(), '../frontend/public', filename),
        path_1.default.join(process.cwd(), 'public', filename),
        path_1.default.join(process.cwd(), filename),
    ];
    return candidates.find((p) => fs_1.default.existsSync(p)) || null;
}
function absUrl(url) {
    if (!url)
        return null;
    const abs = path_1.default.join(process.cwd(), url.replace(/^\//, ''));
    return fs_1.default.existsSync(abs) ? abs : null;
}
async function generateLetterPdf(letter) {
    const logo = asset('KNT-Logo.png');
    const seal = absUrl(letter.seal_url) || logo;
    const qr = await qrcode_1.default.toDataURL(`${env_1.env.CLIENT_URL}/verify/${letter.verify_code}`, { margin: 1, width: 140 });
    const dir = path_1.default.join(process.cwd(), 'uploads/letters');
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    const fileName = `${letter.letter_no}.pdf`;
    const content = [
        {
            columns: [
                logo ? { image: logo, width: 56 } : { text: 'KNT', bold: true, color: '#1B4D3E' },
                {
                    stack: [
                        { text: 'KNT WORLD WELFARE FOUNDATION', bold: true, fontSize: 14, color: '#1B4D3E' },
                        { text: 'Official correspondence', fontSize: 9, color: '#777' },
                    ],
                    margin: [10, 8, 0, 0],
                },
            ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 500, y2: 10, lineWidth: 1.5, lineColor: '#C9A227' }], margin: [0, 0, 0, 16] },
        { text: `Letter no: ${letter.letter_no}`, fontSize: 9, color: '#555' },
        { text: `Date: ${new Date().toLocaleDateString('en-IN')}`, fontSize: 9, color: '#555', margin: [0, 0, 0, 16] },
        { text: letter.subject, bold: true, fontSize: 13, margin: [0, 0, 0, 12] },
        { text: letter.body, fontSize: 11, lineHeight: 1.35 },
        {
            columns: [
                seal ? { image: seal, width: 72, margin: [0, 28, 0, 0] } : { text: '' },
                { image: qr, width: 72, alignment: 'right', margin: [0, 20, 0, 0] },
            ],
        },
        {
            columns: [
                { text: 'Authorized signatory / digital seal', fontSize: 8, color: '#777' },
                { text: `Scan to verify\n${letter.verify_code}`, alignment: 'right', fontSize: 8, color: '#777' },
            ],
        },
    ];
    const pdfDoc = await printer.createPdfKitDocument({
        pageSize: 'A4',
        pageMargins: [48, 48, 48, 48],
        defaultStyle: { font: 'Helvetica' },
        content,
    });
    const filePath = path_1.default.join(dir, fileName);
    await new Promise((resolve, reject) => {
        const stream = fs_1.default.createWriteStream(filePath);
        pdfDoc.pipe(stream);
        pdfDoc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
    });
    return `/uploads/letters/${fileName}`;
}
