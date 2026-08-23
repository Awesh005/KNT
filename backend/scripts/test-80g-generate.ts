import fs from 'fs';
import path from 'path';
import {
  buildCertificateNumber,
  formatCertificateDate,
  generateEightyGCertificatePdf,
} from '../src/modules/documents/eighty-g-certificate.generator';

async function main() {
  const buffer = await generateEightyGCertificatePdf({
    donorName: 'Rahul Sharma',
    amount: 25000,
    purpose: 'Education for Underprivileged Children',
    certificateNo: buildCertificateNumber(),
    date: formatCertificateDate(),
  });

  const outDir = path.join(process.cwd(), 'uploads/certificates');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'sample-80g-generated.pdf');
  fs.writeFileSync(outPath, buffer);
  console.log('Wrote', outPath);
}

main().catch(console.error);
