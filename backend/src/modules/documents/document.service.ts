const PdfPrinter = require('pdfmake/js/Printer').default;
import fs from 'fs';
import path from 'path';
import { randomUUID as uuidv4 } from 'crypto';
import { AppError } from '../../utils/errors';
import { documentModel } from './document.model';
import { donationService } from '../donations/donation.service';
import { cmsModel } from '../cms/cms.model';
import { ORG, cmsDetail } from '../../config/org';
import {
  buildCertificateNumber,
  formatCertificateDate,
  generateEightyGCertificatePdf,
} from './eighty-g-certificate.generator';

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
  resolve: () => {},
  resolved: () => Promise.resolve()
};

const printer = new PdfPrinter(fonts, null, dummyUrlResolver);

function getAssetPath(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'public', filename),
    path.join(process.cwd(), filename),
    path.join(__dirname, '../public', filename),
    path.join(__dirname, '../../public', filename),
    path.join(__dirname, '../../../public', filename),
    path.join(__dirname, '../../../../frontend/public', filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export const documentService = {
  async generateReceipt(donationId: string) {
    // 1. Check if receipt already exists
    const existing = await documentModel.getReceiptByDonationId(donationId);
    if (existing) return existing;

    // 2. Fetch donation details
    const donation = await donationService.getDonationById(donationId);
    if (donation.status !== 'verified') {
      throw new AppError('Cannot generate receipt for unverified donation', 400);
    }

    // Fetch org details from CMS
    let regNo80G = ORG.itUrn;
    let csrNo = ORG.csr;
    let orgPan = ORG.pan;
    let orgCin = ORG.cin;
    let orgName = ORG.name;
    let registeredOffice = ORG.address;
    try {
      const aboutContent = await cmsModel.getContent('about', 'main');
      if (aboutContent?.content?.companyDetails) {
        const details = aboutContent.content.companyDetails;
        orgName = cmsDetail(details, 'ORGANIZATION NAME', orgName);
        registeredOffice = cmsDetail(details, 'REGISTERED OFFICE', registeredOffice);
        orgPan = cmsDetail(details, 'PAN', orgPan);
        orgCin = cmsDetail(details, 'CIN', orgCin);
        csrNo = cmsDetail(details, 'CSR REG. NO.', csrNo);
        regNo80G =
          cmsDetail(details, '80G / IT URN', '') ||
          cmsDetail(details, '80G REG. NO.', '') ||
          regNo80G;
      }
    } catch (e) {
      console.error('Error fetching CMS content for receipt', e);
    }

    const receiptNo = await documentModel.nextReceiptNumber();
    const logoFile = getAssetPath('KNT-Logo.png');
    const signatureFile = getAssetPath('signature.png');

    const content: any[] = [];
    if (logoFile) {
      content.push({
        image: logoFile,
        width: 120,
        alignment: 'center',
        margin: [0, 0, 0, 10]
      });
    }

    content.push(
      { text: orgName.toUpperCase(), style: 'header', alignment: 'center' },
      registeredOffice ? { text: registeredOffice, alignment: 'center', fontSize: 9, margin: [40, 0, 40, 8], color: '#555555' } : { text: '', margin: [0, 0, 0, 0] },
      { text: 'DONATION RECEIPT', style: 'subheader', alignment: 'center', margin: [0, 5, 0, 20] },
      {
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
      },
      { text: 'This receipt is issued for a donation received towards charitable objects of the foundation.', margin: [0, 24, 0, 8], alignment: 'center', italics: true, fontSize: 9 }
    );

    if (signatureFile) {
      content.push({
        image: signatureFile,
        width: 100,
        alignment: 'right',
        margin: [0, 20, 20, 0]
      });
    }

    content.push(
      { text: 'Kanhaiya Lal', alignment: 'right', margin: [0, 5, 15, 0], bold: true, fontSize: 12 },
      { text: 'Founder / Authorized Signatory', alignment: 'right', margin: [0, 2, 15, 0], color: '#666666', fontSize: 10 }
    );

    const docDefinition: any = {
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
    const uploadsDir = path.join(__dirname, '../../../uploads/receipts');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = `${receiptNo.replace(/\//g, '-')}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    await new Promise<void>((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // 5. Save to database
    const id = 'DOC-' + uuidv4().split('-')[0].toUpperCase();
    const pdfUrl = `/uploads/receipts/${fileName}`;
    await documentModel.saveReceipt(id, donationId, receiptNo, pdfUrl);

    return await documentModel.getReceiptByDonationId(donationId);
  },

  async generate80G(donationId: string, options?: { regenerate?: boolean }) {
    const existing = await documentModel.get80GCertificateByDonationId(donationId);

    if (existing && !options?.regenerate) {
      return existing;
    }

    if (existing && options?.regenerate) {
      const oldPath = existing.pdf_url?.replace(/^\//, '');
      const candidates = [
        path.join(process.cwd(), oldPath),
        path.join(__dirname, '../../../', oldPath),
      ];
      for (const filePath of candidates) {
        if (filePath && fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch { /* ignore */ }
        }
      }
      await documentModel.delete80GCertificateByDonationId(donationId);
    }

    const donation = await donationService.getDonationById(donationId);
    if (donation.status !== 'verified') {
      throw new AppError('Cannot generate 80G for unverified donation', 400);
    }

    const donorName = donation.donor_name || donation.guest_name || 'Donor';
    const purpose = donation.campaign_title || 'General Welfare & Humanitarian Service';
    const certNo = buildCertificateNumber();
    const donatedAt = donation.donated_at || donation.created_at;

    const pdfBuffer = await generateEightyGCertificatePdf({
      donorName,
      amount: Number(donation.amount),
      purpose,
      certificateNo: certNo,
      date: formatCertificateDate(donatedAt),
    });

    const uploadsDir = path.join(process.cwd(), 'uploads/certificates');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeFileName = certNo.replace(/\//g, '-');
    const fileName = `${safeFileName}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    const id = 'DOC-' + uuidv4().split('-')[0].toUpperCase();
    const pdfUrl = `/uploads/certificates/${fileName}`;
    await documentModel.save80GCertificate(id, donationId, certNo, pdfUrl);

    return await documentModel.get80GCertificateByDonationId(donationId);
  },
};
