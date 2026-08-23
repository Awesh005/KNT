import crypto from 'crypto';

function resolveKey(raw: string) {
  const trimmed = raw.trim();
  const looksB64 = /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0;
  if (looksB64) {
    const decoded = Buffer.from(trimmed, 'base64');
    if (decoded.length === 16 || decoded.length === 24 || decoded.length === 32) return decoded;
  }
  const utf = Buffer.from(trimmed, 'utf8');
  if (utf.length === 16 || utf.length === 32) return utf;
  const padded = Buffer.alloc(16);
  utf.copy(padded);
  return padded;
}

function algorithm(key: Buffer) {
  if (key.length === 32) return 'aes-256-cbc';
  if (key.length === 24) return 'aes-192-cbc';
  return 'aes-128-cbc';
}

export function sbiEncrypt(plain: string, merchantKey: string) {
  const key = resolveKey(merchantKey);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm(key), key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

export function sbiDecrypt(payload: string, merchantKey: string) {
  const key = resolveKey(merchantKey);
  const buf = Buffer.from(String(payload || '').replace(/\s/g, ''), 'base64');
  if (buf.length < 17) throw new Error('Invalid SBI payload');
  const iv = buf.subarray(0, 16);
  const data = buf.subarray(16);
  const decipher = crypto.createDecipheriv(algorithm(key), key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export function parsePipe(value: string) {
  return String(value || '').split('|').map((part) => part.trim());
}

export function buildEncryptTrans(fields: {
  merchantId: string;
  amount: string;
  otherDetails: string;
  successUrl: string;
  failUrl: string;
  orderNo: string;
  customerId: string;
  paymode: string;
}) {
  return [
    fields.merchantId,
    'DOM',
    'IN',
    'INR',
    fields.amount,
    fields.otherDetails || 'NA',
    fields.successUrl,
    fields.failUrl,
    'SBIEPAY',
    fields.orderNo,
    fields.customerId,
    fields.paymode,
    'ONLINE',
    'ONLINE',
  ].join('|');
}

export function buildBillingDetails(fields: {
  name: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}) {
  return [
    fields.name || 'Donor',
    fields.city || 'NA',
    fields.state || 'NA',
    fields.pincode || '000000',
    'IN',
    fields.phone || 'NA',
    '',
    '',
    fields.phone || 'NA',
    fields.email || 'NA',
    'N',
  ].join('|');
}

export function parseSbiResponse(decrypted: string) {
  const parts = parsePipe(decrypted);
  const status = (parts[2] || '').toUpperCase();
  return {
    merchantOrderNo: parts[0],
    sbiRef: parts[1],
    status,
    statusCode: parts[3],
    currency: parts[4],
    paymode: parts[5],
    otherDetails: parts[6],
    statusDescription: parts[7],
    merchantId: parts[13],
    amount: parts[14],
    raw: decrypted,
    success: status === 'SUCCESS',
  };
}
