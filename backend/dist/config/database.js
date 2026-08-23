"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
const useLocalDb = !env_1.env.DATABASE_URL ||
    env_1.env.DATABASE_URL.includes('localhost') ||
    env_1.env.DATABASE_URL.includes('127.0.0.1');
const poolConfig = !useLocalDb && env_1.env.DATABASE_URL
    ? { uri: env_1.env.DATABASE_URL }
    : {
        host: env_1.env.DB_HOST === 'localhost' ? '127.0.0.1' : env_1.env.DB_HOST,
        port: parseInt(env_1.env.DB_PORT, 10),
        user: env_1.env.DB_USER,
        password: env_1.env.DB_PASSWORD,
        database: env_1.env.DB_NAME,
    };
exports.pool = promise_1.default.createPool({
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
    exports.pool.query('SELECT 1').catch(() => undefined);
}, 25000).unref();
