import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5001'),
  
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().optional().default(''),
  DB_NAME: z.string().default('knt_db'),
  
  JWT_SECRET: z.string().min(4).default('super_secret_key_knt_foundation_production_2026_welfare'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  ADMIN_EMAIL: z.string().default('admin@kntwelfare.org'),
  ADMIN_PASSWORD: z.string().default('admin'),
  
  CLIENT_URL: z.string().default('https://bnintelhub.site'),
  
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  API_PUBLIC_URL: z.string().optional(),
  SBI_MERCHANT_ID: z.string().optional(),
  SBI_ENCRYPTION_KEY: z.string().optional(),
  SBI_GATEWAY_URL: z.string().default('https://www.sbiepay.sbi/secure/AggregatorHostedListener'),
  SBI_VERIFY_URL: z.string().optional(),
  SBI_REFUND_URL: z.string().optional(),
  SBI_RETURN_URL: z.string().optional(),
  SBI_PAYMODE: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ Environment variable validation warnings:', _env.error.format());
}

export const env = _env.success ? _env.data : {
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

