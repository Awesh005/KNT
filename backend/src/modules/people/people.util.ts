import fs from 'fs';
import path from 'path';

export function saveDataUrl(dataUrl: string | undefined, folder: string, prefix: string) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const match = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const ext = mime.includes('png') ? 'png' : mime.includes('pdf') ? 'pdf' : mime.includes('jpeg') ? 'jpg' : 'jpg';
  const dir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fileName = `${prefix}-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(dir, fileName), Buffer.from(match[2], 'base64'));
  return `/uploads/${folder}/${fileName}`;
}

export const MEMBERSHIP_FEES: Record<string, number> = {
  annual: 1100,
  student: 500,
  lifetime: 11000,
};
