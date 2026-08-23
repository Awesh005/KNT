import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

async function main() {
  const filePath = path.join(process.cwd(), 'uploads/80g_certificates/certificate.pdf');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  console.log('viewport', viewport.width, viewport.height);
  const textContent = await page.getTextContent();
  for (const item of textContent.items as any[]) {
    if (item.str?.trim()) {
      console.log(JSON.stringify({ text: item.str, x: item.transform[4], y: item.transform[5] }));
    }
  }
}

main().catch(console.error);
