"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sbiConfigured = sbiConfigured;
exports.sbiPublicConfig = sbiPublicConfig;
exports.buildCheckoutForm = buildCheckoutForm;
exports.decryptSbiPayload = decryptSbiPayload;
exports.doubleVerify = doubleVerify;
exports.requestSbiRefund = requestSbiRefund;
const env_1 = require("../../config/env");
const sbi_crypto_1 = require("./sbi.crypto");
const logger_1 = require("../../config/logger");
function sbiConfigured() {
    return Boolean(env_1.env.SBI_MERCHANT_ID && env_1.env.SBI_ENCRYPTION_KEY);
}
function sbiPublicConfig() {
    return {
        enabled: sbiConfigured(),
        provider: 'sbi_epay',
        fallback: 'upi',
        gatewayUrl: env_1.env.SBI_GATEWAY_URL,
    };
}
function amountString(amount) {
    return Number(amount).toFixed(2);
}
function buildCheckoutForm(input) {
    if (!sbiConfigured()) {
        throw new Error('SBI ePay credentials are not configured yet');
    }
    const successUrl = env_1.env.SBI_RETURN_URL
        || `${(env_1.env.API_PUBLIC_URL || env_1.env.CLIENT_URL).replace(/\/$/, '')}/api/v1/payments/sbi/return`;
    const failUrl = successUrl;
    const paymode = env_1.env.SBI_PAYMODE || '';
    const trans = (0, sbi_crypto_1.buildEncryptTrans)({
        merchantId: env_1.env.SBI_MERCHANT_ID,
        amount: amountString(input.amount),
        otherDetails: (input.otherDetails || 'Donation').replace(/\|/g, ' '),
        successUrl,
        failUrl,
        orderNo: input.donationId,
        customerId: (input.email || input.donationId).slice(0, 40),
        paymode,
    });
    const billing = (0, sbi_crypto_1.buildBillingDetails)({
        name: input.name,
        city: input.city || 'NA',
        state: input.state || 'NA',
        pincode: input.pincode || '000000',
        phone: input.phone || 'NA',
        email: input.email,
    });
    return {
        gatewayUrl: env_1.env.SBI_GATEWAY_URL,
        fields: {
            EncryptTrans: (0, sbi_crypto_1.sbiEncrypt)(trans, env_1.env.SBI_ENCRYPTION_KEY),
            EncryptbillingDetails: (0, sbi_crypto_1.sbiEncrypt)(billing, env_1.env.SBI_ENCRYPTION_KEY),
            merchIdVal: env_1.env.SBI_MERCHANT_ID,
        },
    };
}
function decryptSbiPayload(encData) {
    return (0, sbi_crypto_1.parseSbiResponse)((0, sbi_crypto_1.sbiDecrypt)(encData, env_1.env.SBI_ENCRYPTION_KEY));
}
async function doubleVerify(orderNo, amount) {
    if (!env_1.env.SBI_VERIFY_URL || !sbiConfigured())
        return null;
    const query = [
        env_1.env.SBI_MERCHANT_ID,
        'DOM',
        'IN',
        'INR',
        amountString(amount),
        orderNo,
    ].join('|');
    const body = new URLSearchParams({
        queryRequest: (0, sbi_crypto_1.sbiEncrypt)(query, env_1.env.SBI_ENCRYPTION_KEY),
        aggregatorId: 'SBIEPAY',
        merchantId: env_1.env.SBI_MERCHANT_ID,
    });
    try {
        const res = await fetch(env_1.env.SBI_VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const text = await res.text();
        try {
            return (0, sbi_crypto_1.parseSbiResponse)((0, sbi_crypto_1.sbiDecrypt)(text.trim(), env_1.env.SBI_ENCRYPTION_KEY));
        }
        catch {
            return { raw: text, success: /SUCCESS/i.test(text) };
        }
    }
    catch (error) {
        logger_1.logger.error('SBI double verification failed', error?.message || error);
        return null;
    }
}
async function requestSbiRefund(orderNo, sbiRef, amount, reason) {
    if (!env_1.env.SBI_REFUND_URL || !sbiConfigured())
        return { submitted: false, localOnly: true };
    const payload = [
        env_1.env.SBI_MERCHANT_ID,
        'DOM',
        'IN',
        'INR',
        amountString(amount),
        orderNo,
        sbiRef || 'NA',
        (reason || 'Donor refund').replace(/\|/g, ' '),
    ].join('|');
    const body = new URLSearchParams({
        queryRequest: (0, sbi_crypto_1.sbiEncrypt)(payload, env_1.env.SBI_ENCRYPTION_KEY),
        aggregatorId: 'SBIEPAY',
        merchantId: env_1.env.SBI_MERCHANT_ID,
    });
    const res = await fetch(env_1.env.SBI_REFUND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    const text = await res.text();
    return { submitted: true, localOnly: false, raw: text };
}
