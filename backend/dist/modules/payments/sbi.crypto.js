"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sbiEncrypt = sbiEncrypt;
exports.sbiDecrypt = sbiDecrypt;
exports.parsePipe = parsePipe;
exports.buildEncryptTrans = buildEncryptTrans;
exports.buildBillingDetails = buildBillingDetails;
exports.parseSbiResponse = parseSbiResponse;
const crypto_1 = __importDefault(require("crypto"));
function resolveKey(raw) {
    const trimmed = raw.trim();
    const looksB64 = /^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0;
    if (looksB64) {
        const decoded = Buffer.from(trimmed, 'base64');
        if (decoded.length === 16 || decoded.length === 24 || decoded.length === 32)
            return decoded;
    }
    const utf = Buffer.from(trimmed, 'utf8');
    if (utf.length === 16 || utf.length === 32)
        return utf;
    const padded = Buffer.alloc(16);
    utf.copy(padded);
    return padded;
}
function algorithm(key) {
    if (key.length === 32)
        return 'aes-256-cbc';
    if (key.length === 24)
        return 'aes-192-cbc';
    return 'aes-128-cbc';
}
function sbiEncrypt(plain, merchantKey) {
    const key = resolveKey(merchantKey);
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(algorithm(key), key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
}
function sbiDecrypt(payload, merchantKey) {
    const key = resolveKey(merchantKey);
    const buf = Buffer.from(String(payload || '').replace(/\s/g, ''), 'base64');
    if (buf.length < 17)
        throw new Error('Invalid SBI payload');
    const iv = buf.subarray(0, 16);
    const data = buf.subarray(16);
    const decipher = crypto_1.default.createDecipheriv(algorithm(key), key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
function parsePipe(value) {
    return String(value || '').split('|').map((part) => part.trim());
}
function buildEncryptTrans(fields) {
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
function buildBillingDetails(fields) {
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
function parseSbiResponse(decrypted) {
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
