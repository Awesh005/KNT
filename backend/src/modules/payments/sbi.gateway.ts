import { env } from '../../config/env';
import { sbiEncrypt, sbiDecrypt, buildEncryptTrans, buildBillingDetails, parseSbiResponse } from './sbi.crypto';
import { logger } from '../../config/logger';

export function sbiConfigured() {
  return Boolean(env.SBI_MERCHANT_ID && env.SBI_ENCRYPTION_KEY);
}

export function sbiPublicConfig() {
  return {
    enabled: sbiConfigured(),
    provider: 'sbi_epay',
    fallback: 'upi',
    gatewayUrl: env.SBI_GATEWAY_URL,
  };
}

function amountString(amount: number) {
  return Number(amount).toFixed(2);
}

export function buildCheckoutForm(input: {
  donationId: string;
  amount: number;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  otherDetails?: string;
}) {
  if (!sbiConfigured()) {
    throw new Error('SBI ePay credentials are not configured yet');
  }

  const successUrl = env.SBI_RETURN_URL
    || `${(env.API_PUBLIC_URL || env.CLIENT_URL).replace(/\/$/, '')}/api/v1/payments/sbi/return`;
  const failUrl = successUrl;
  const paymode = env.SBI_PAYMODE || '';
  const trans = buildEncryptTrans({
    merchantId: env.SBI_MERCHANT_ID!,
    amount: amountString(input.amount),
    otherDetails: (input.otherDetails || 'Donation').replace(/\|/g, ' '),
    successUrl,
    failUrl,
    orderNo: input.donationId,
    customerId: (input.email || input.donationId).slice(0, 40),
    paymode,
  });
  const billing = buildBillingDetails({
    name: input.name,
    city: input.city || 'NA',
    state: input.state || 'NA',
    pincode: input.pincode || '000000',
    phone: input.phone || 'NA',
    email: input.email,
  });

  return {
    gatewayUrl: env.SBI_GATEWAY_URL,
    fields: {
      EncryptTrans: sbiEncrypt(trans, env.SBI_ENCRYPTION_KEY!),
      EncryptbillingDetails: sbiEncrypt(billing, env.SBI_ENCRYPTION_KEY!),
      merchIdVal: env.SBI_MERCHANT_ID,
    },
  };
}

export function decryptSbiPayload(encData: string) {
  return parseSbiResponse(sbiDecrypt(encData, env.SBI_ENCRYPTION_KEY!));
}

export async function doubleVerify(orderNo: string, amount: number) {
  if (!env.SBI_VERIFY_URL || !sbiConfigured()) return null;
  const query = [
    env.SBI_MERCHANT_ID,
    'DOM',
    'IN',
    'INR',
    amountString(amount),
    orderNo,
  ].join('|');
  const body = new URLSearchParams({
    queryRequest: sbiEncrypt(query, env.SBI_ENCRYPTION_KEY!),
    aggregatorId: 'SBIEPAY',
    merchantId: env.SBI_MERCHANT_ID!,
  });
  try {
    const res = await fetch(env.SBI_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const text = await res.text();
    try {
      return parseSbiResponse(sbiDecrypt(text.trim(), env.SBI_ENCRYPTION_KEY!));
    } catch {
      return { raw: text, success: /SUCCESS/i.test(text) };
    }
  } catch (error: any) {
    logger.error('SBI double verification failed', error?.message || error);
    return null;
  }
}

export async function requestSbiRefund(orderNo: string, sbiRef: string, amount: number, reason: string) {
  if (!env.SBI_REFUND_URL || !sbiConfigured()) return { submitted: false, localOnly: true };
  const payload = [
    env.SBI_MERCHANT_ID,
    'DOM',
    'IN',
    'INR',
    amountString(amount),
    orderNo,
    sbiRef || 'NA',
    (reason || 'Donor refund').replace(/\|/g, ' '),
  ].join('|');
  const body = new URLSearchParams({
    queryRequest: sbiEncrypt(payload, env.SBI_ENCRYPTION_KEY!),
    aggregatorId: 'SBIEPAY',
    merchantId: env.SBI_MERCHANT_ID!,
  });
  const res = await fetch(env.SBI_REFUND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  return { submitted: true, localOnly: false, raw: text };
}
