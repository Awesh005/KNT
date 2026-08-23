"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
exports.authController = {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            (0, response_1.sendSuccess)(res, 201, result, 'Check your email to verify your account before signing in.');
        }
        catch (error) {
            next(error);
        }
    },
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body);
            if (result.requires2fa) {
                (0, response_1.sendSuccess)(res, 200, { requires2fa: true, challengeToken: result.challengeToken }, 'Enter authenticator code');
                return;
            }
            const { user, accessToken, refreshToken } = result;
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            (0, response_1.sendSuccess)(res, 200, { user, accessToken }, 'Logged in successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async logout(req, res, next) {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            (0, response_1.sendSuccess)(res, 200, null, 'Logged out successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({ status: 'fail', message: 'No refresh token' });
            }
            const tokens = auth_service_1.authService.refreshTokens(refreshToken);
            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            (0, response_1.sendSuccess)(res, 200, { accessToken: tokens.accessToken }, 'Token refreshed');
        }
        catch (error) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });
            next(error);
        }
    },
    async getMe(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await auth_service_1.authService.getMe(userId);
            (0, response_1.sendSuccess)(res, 200, { user }, 'User fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async forgotPassword(req, res, next) {
        try {
            const result = await auth_service_1.authService.requestPasswordReset(req.body.email);
            (0, response_1.sendSuccess)(res, 200, result, result.message);
        }
        catch (error) {
            next(error);
        }
    },
    async resetPassword(req, res, next) {
        try {
            const result = await auth_service_1.authService.resetPassword(req.body.token, req.body.password);
            (0, response_1.sendSuccess)(res, 200, result, result.message);
        }
        catch (error) {
            next(error);
        }
    },
    async verifyEmail(req, res, next) {
        try {
            const token = String(req.query.token || req.body.token || '');
            const result = await auth_service_1.authService.verifyEmail(token);
            if (req.method === 'GET') {
                return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?verified=1`);
            }
            (0, response_1.sendSuccess)(res, 200, result, result.message);
        }
        catch (error) {
            next(error);
        }
    },
    async verify2fa(req, res, next) {
        try {
            const { user, accessToken, refreshToken } = await auth_service_1.authService.verify2fa(req.body.challengeToken, req.body.code);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            (0, response_1.sendSuccess)(res, 200, { user, accessToken }, 'Logged in successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async setup2fa(req, res, next) {
        try {
            const data = await auth_service_1.authService.setup2fa(req.user.id);
            (0, response_1.sendSuccess)(res, 200, data, 'Scan this QR in your authenticator app');
        }
        catch (error) {
            next(error);
        }
    },
    async enable2fa(req, res, next) {
        try {
            const data = await auth_service_1.authService.enable2fa(req.user.id, req.body.code);
            (0, response_1.sendSuccess)(res, 200, data, '2FA enabled');
        }
        catch (error) {
            next(error);
        }
    },
    async disable2fa(req, res, next) {
        try {
            const data = await auth_service_1.authService.disable2fa(req.user.id, req.body.code);
            (0, response_1.sendSuccess)(res, 200, data, '2FA disabled');
        }
        catch (error) {
            next(error);
        }
    },
};
