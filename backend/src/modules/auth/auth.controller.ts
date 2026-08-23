import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, 201, result, 'Check your email to verify your account before signing in.');
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body) as any;
      if (result.requires2fa) {
        sendSuccess(res, 200, { requires2fa: true, challengeToken: result.challengeToken }, 'Enter authenticator code');
        return;
      }

      const { user, accessToken, refreshToken } = result;

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, 200, { user, accessToken }, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      sendSuccess(res, 200, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ status: 'fail', message: 'No refresh token' });
      }

      const tokens = authService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, 200, { accessToken: tokens.accessToken }, 'Token refreshed');
    } catch (error) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const user = await authService.getMe(userId);
      sendSuccess(res, 200, { user }, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      sendSuccess(res, 200, result, result.message);
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      sendSuccess(res, 200, result, result.message);
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = String(req.query.token || req.body.token || '');
      const result = await authService.verifyEmail(token);
      if (req.method === 'GET') {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?verified=1`);
      }
      sendSuccess(res, 200, result, result.message);
    } catch (error) {
      next(error);
    }
  },

  async verify2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.verify2fa(req.body.challengeToken, req.body.code);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendSuccess(res, 200, { user, accessToken }, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  },

  async setup2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.setup2fa((req as any).user.id);
      sendSuccess(res, 200, data, 'Scan this QR in your authenticator app');
    } catch (error) {
      next(error);
    }
  },

  async enable2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.enable2fa((req as any).user.id, req.body.code);
      sendSuccess(res, 200, data, '2FA enabled');
    } catch (error) {
      next(error);
    }
  },

  async disable2fa(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.disable2fa((req as any).user.id, req.body.code);
      sendSuccess(res, 200, data, '2FA disabled');
    } catch (error) {
      next(error);
    }
  },
};
