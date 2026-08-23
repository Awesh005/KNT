import mysql from 'mysql2/promise';
import { env } from './env';

const useLocalDb =
  !env.DATABASE_URL ||
  env.DATABASE_URL.includes('localhost') ||
  env.DATABASE_URL.includes('127.0.0.1');

const poolConfig: mysql.PoolOptions = !useLocalDb && env.DATABASE_URL
  ? { uri: env.DATABASE_URL }
  : {
      host: env.DB_HOST === 'localhost' ? '127.0.0.1' : env.DB_HOST,
      port: parseInt(env.DB_PORT, 10),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    };

export const pool = mysql.createPool({
  ...poolConfig,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 30000,
  queueLimit: 20,
  connectTimeout: 8000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

setInterval(() => {
  pool.query('SELECT 1').catch(() => undefined);
}, 25000).unref();
