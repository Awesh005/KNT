"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const auth_model_1 = require("./auth.model");
const env_1 = require("../../config/env");
const errors_1 = require("../../utils/errors");
const mail_service_1 = require("../../services/mail.service");
const qrcode_1 = __importDefault(require("qrcode"));
const totp_1 = require("../../utils/totp");
exports.authService = {
    generateTokens(user) {
        const payload = { id: user.id, role: user.role };
        // Access token (15 mins)
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: '15m' });
        // Refresh token (from env setting, default 7d)
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        return { accessToken, refreshToken };
    },
    async register(data) {
        const existingUser = await auth_model_1.authModel.findUserByEmail(data.email);
        if (existingUser) {
            throw new errors_1.ValidationError('Email already exists');
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        const userId = 'USR-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        const verifyToken = (0, crypto_1.randomBytes)(32).toString('hex');
        await auth_model_1.authModel.createUser(userId, data.name, data.email, hashedPassword, {
            email_verified: 0,
            email_verify_token: verifyToken,
        });
        const verifyUrl = `${env_1.env.CLIENT_URL.replace(/\/$/, '')}/verify-email?token=${verifyToken}`;
        void mail_service_1.mailService.sendEmailVerify(data.name, data.email, verifyUrl);
        return {
            id: userId,
            name: data.name,
            email: data.email,
            role: 'Donor',
            emailVerificationRequired: true,
        };
    },
    async login(data) {
        const user = await auth_model_1.authModel.findUserByEmail(data.email);
        if (!user || user.status !== 'active') {
            throw new errors_1.UnauthorizedError('Invalid credentials or account inactive');
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.password_hash);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        if (Number(user.email_verified) === 0 && !['Admin', 'Super Admin', 'Member', 'Volunteer', 'Employee'].includes(user.role)) {
            throw new errors_1.ValidationError('Please verify your email before signing in. Check your inbox.');
        }
        if (Number(user.totp_enabled) === 1) {
            const challengeToken = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, purpose: '2fa' }, env_1.env.JWT_SECRET, { expiresIn: '5m' });
            return {
                requires2fa: true,
                challengeToken,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            };
        }
        const tokens = this.generateTokens(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        };
    },
    async getMe(userId) {
        const user = await auth_model_1.authModel.findUserById(userId);
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        return user;
    },
    refreshTokens(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
            return this.generateTokens(decoded);
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
    },
    async requestPasswordReset(email) {
        const user = await auth_model_1.authModel.findUserByEmail(email);
        if (!user || user.status !== 'active') {
            return { message: 'If an account exists for this email, a reset link has been sent.' };
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await auth_model_1.authModel.createPasswordResetToken(user.id, token, expiresAt);
        const resetUrl = `${env_1.env.CLIENT_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
        void mail_service_1.mailService.sendPasswordReset(user.email, resetUrl);
        return { message: 'If an account exists for this email, a reset link has been sent.' };
    },
    async resetPassword(token, password) {
        const resetRecord = await auth_model_1.authModel.findValidResetToken(token);
        if (!resetRecord) {
            throw new errors_1.ValidationError('Invalid or expired reset link');
        }
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        await auth_model_1.authModel.updatePassword(resetRecord.user_id, passwordHash);
        await auth_model_1.authModel.markResetTokenUsed(token);
        return { message: 'Password updated successfully' };
    },
    async verifyEmail(token) {
        const ok = await auth_model_1.authModel.setEmailVerified(token);
        if (!ok)
            throw new errors_1.ValidationError('Invalid or expired verification link');
        return { message: 'Email verified. You can sign in now.' };
    },
    async verify2fa(challengeToken, code) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(challengeToken, env_1.env.JWT_SECRET);
        }
        catch {
            throw new errors_1.UnauthorizedError('2FA session expired. Please sign in again.');
        }
        if (decoded.purpose !== '2fa')
            throw new errors_1.UnauthorizedError('Invalid 2FA session');
        const user = await auth_model_1.authModel.findUserAuthById(decoded.id);
        if (!user || !user.totp_secret)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        if (!(0, totp_1.verifyTotp)(user.totp_secret, code)) {
            throw new errors_1.ValidationError('Invalid authenticator code');
        }
        const tokens = this.generateTokens(user);
        return {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            ...tokens,
        };
    },
    async setup2fa(userId) {
        const user = await auth_model_1.authModel.findUserAuthById(userId);
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        if (!['Admin', 'Super Admin'].includes(user.role)) {
            throw new errors_1.ValidationError('2FA is available for administrators');
        }
        const secret = (0, totp_1.generateTotpSecret)();
        await auth_model_1.authModel.setTotp(userId, secret, false);
        const otpauthUrl = (0, totp_1.totpOtpauthUrl)(user.email, secret);
        const qrDataUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        return { secret, otpauthUrl, qrDataUrl };
    },
    async enable2fa(userId, code) {
        const user = await auth_model_1.authModel.findUserAuthById(userId);
        if (!user?.totp_secret)
            throw new errors_1.ValidationError('Start 2FA setup first');
        if (!(0, totp_1.verifyTotp)(user.totp_secret, code))
            throw new errors_1.ValidationError('Invalid authenticator code');
        await auth_model_1.authModel.setTotp(userId, user.totp_secret, true);
        return { enabled: true };
    },
    async disable2fa(userId, code) {
        const user = await auth_model_1.authModel.findUserAuthById(userId);
        if (!user?.totp_secret || !user.totp_enabled)
            return { enabled: false };
        if (!(0, totp_1.verifyTotp)(user.totp_secret, code))
            throw new errors_1.ValidationError('Invalid authenticator code');
        await auth_model_1.authModel.setTotp(userId, null, false);
        return { enabled: false };
    },
};
