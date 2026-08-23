"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5001'),
    DATABASE_URL: zod_1.z.string().optional(),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.string().default('3306'),
    DB_USER: zod_1.z.string().default('root'),
    DB_PASSWORD: zod_1.z.string().optional().default(''),
    DB_NAME: zod_1.z.string().default('knt_db'),
    JWT_SECRET: zod_1.z.string().min(4).default('super_secret_key_knt_foundation_production_2026_welfare'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    ADMIN_EMAIL: zod_1.z.string().default('admin@kntwelfare.org'),
    ADMIN_PASSWORD: zod_1.z.string().default('admin'),
    CLIENT_URL: zod_1.z.string().default('https://bnintelhub.site'),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    FROM_EMAIL: zod_1.z.string().optional(),
    API_PUBLIC_URL: zod_1.z.string().optional(),
    SBI_MERCHANT_ID: zod_1.z.string().optional(),
    SBI_ENCRYPTION_KEY: zod_1.z.string().optional(),
    SBI_GATEWAY_URL: zod_1.z.string().default('https://www.sbiepay.sbi/secure/AggregatorHostedListener'),
    SBI_VERIFY_URL: zod_1.z.string().optional(),
    SBI_REFUND_URL: zod_1.z.string().optional(),
    SBI_RETURN_URL: zod_1.z.string().optional(),
    SBI_PAYMODE: zod_1.z.string().optional(),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.warn('⚠️ Environment variable validation warnings:', _env.error.format());
}
exports.env = _env.success ? _env.data : {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '5001',
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'knt_db',
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_key_knt_foundation_production_2026_welfare',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@kntwelfare.org',
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
    CLIENT_URL: process.env.CLIENT_URL || 'https://bnintelhub.site',
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL,
    API_PUBLIC_URL: process.env.API_PUBLIC_URL,
    SBI_MERCHANT_ID: process.env.SBI_MERCHANT_ID,
    SBI_ENCRYPTION_KEY: process.env.SBI_ENCRYPTION_KEY,
    SBI_GATEWAY_URL: process.env.SBI_GATEWAY_URL || 'https://www.sbiepay.sbi/secure/AggregatorHostedListener',
    SBI_VERIFY_URL: process.env.SBI_VERIFY_URL,
    SBI_REFUND_URL: process.env.SBI_REFUND_URL,
    SBI_RETURN_URL: process.env.SBI_RETURN_URL,
    SBI_PAYMODE: process.env.SBI_PAYMODE,
};
