import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID as uuidv4, randomBytes } from 'crypto';
import { authModel } from './auth.model';
import { env } from '../../config/env';
import { AppError, UnauthorizedError, ValidationError } from '../../utils/errors';
import { mailService } from '../../services/mail.service';
import QRCode from 'qrcode';
import { generateTotpSecret, totpOtpauthUrl, verifyTotp } from '../../utils/totp';

export const authService = {
  generateTokens(user: { id: string; role: string }) {
    const payload = { id: user.id, role: user.role };
    
    // Access token (15 mins)
    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
    
    // Refresh token (from env setting, default 7d)
    const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
    
    return { accessToken, refreshToken };
  },

  async register(data: any) {
    const existingUser = await authModel.findUserByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = 'USR-' + uuidv4().split('-')[0].toUpperCase();
    const verifyToken = randomBytes(32).toString('hex');

    await authModel.createUser(userId, data.name, data.email, hashedPassword, {
      email_verified: 0,
      email_verify_token: verifyToken,
    });

    const verifyUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/verify-email?token=${verifyToken}`;
    void mailService.sendEmailVerify(data.name, data.email, verifyUrl);

    return {
      id: userId,
      name: data.name,
      email: data.email,
      role: 'Donor',
      emailVerificationRequired: true,
    };
  },

  async login(data: any) {
    const user = await authModel.findUserByEmail(data.email);
    
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('Invalid credentials or account inactive');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (Number(user.email_verified) === 0 && !['Admin', 'Super Admin', 'Member', 'Volunteer', 'Employee'].includes(user.role)) {
      throw new ValidationError('Please verify your email before signing in. Check your inbox.');
    }

    if (Number(user.totp_enabled) === 1) {
      const challengeToken = jwt.sign(
        { id: user.id, role: user.role, purpose: '2fa' },
        env.JWT_SECRET,
        { expiresIn: '5m' }
      );
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

  async getMe(userId: string) {
    const user = await authModel.findUserById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  },

  refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { id: string; role: string };
      return this.generateTokens(decoded);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },

  async requestPasswordReset(email: string) {
    const user = await authModel.findUserByEmail(email);
    if (!user || user.status !== 'active') {
      return { message: 'If an account exists for this email, a reset link has been sent.' };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await authModel.createPasswordResetToken(user.id, token, expiresAt);

    const resetUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/reset-password?token=${token}`;
    void mailService.sendPasswordReset(user.email, resetUrl);

    return { message: 'If an account exists for this email, a reset link has been sent.' };
  },

  async resetPassword(token: string, password: string) {
    const resetRecord = await authModel.findValidResetToken(token);
    if (!resetRecord) {
      throw new ValidationError('Invalid or expired reset link');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await authModel.updatePassword(resetRecord.user_id, passwordHash);
    await authModel.markResetTokenUsed(token);

    return { message: 'Password updated successfully' };
  },

  async verifyEmail(token: string) {
    const ok = await authModel.setEmailVerified(token);
    if (!ok) throw new ValidationError('Invalid or expired verification link');
    return { message: 'Email verified. You can sign in now.' };
  },

  async verify2fa(challengeToken: string, code: string) {
    let decoded: { id: string; role: string; purpose?: string };
    try {
      decoded = jwt.verify(challengeToken, env.JWT_SECRET) as any;
    } catch {
      throw new UnauthorizedError('2FA session expired. Please sign in again.');
    }
    if (decoded.purpose !== '2fa') throw new UnauthorizedError('Invalid 2FA session');
    const user = await authModel.findUserAuthById(decoded.id);
    if (!user || !user.totp_secret) throw new UnauthorizedError('Invalid credentials');
    if (!verifyTotp(user.totp_secret, code)) {
      throw new ValidationError('Invalid authenticator code');
    }
    const tokens = this.generateTokens(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      ...tokens,
    };
  },

  async setup2fa(userId: string) {
    const user = await authModel.findUserAuthById(userId);
    if (!user) throw new AppError('User not found', 404);
    if (!['Admin', 'Super Admin'].includes(user.role)) {
      throw new ValidationError('2FA is available for administrators');
    }
    const secret = generateTotpSecret();
    await authModel.setTotp(userId, secret, false);
    const otpauthUrl = totpOtpauthUrl(user.email, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { secret, otpauthUrl, qrDataUrl };
  },

  async enable2fa(userId: string, code: string) {
    const user = await authModel.findUserAuthById(userId);
    if (!user?.totp_secret) throw new ValidationError('Start 2FA setup first');
    if (!verifyTotp(user.totp_secret, code)) throw new ValidationError('Invalid authenticator code');
    await authModel.setTotp(userId, user.totp_secret, true);
    return { enabled: true };
  },

  async disable2fa(userId: string, code: string) {
    const user = await authModel.findUserAuthById(userId);
    if (!user?.totp_secret || !user.totp_enabled) return { enabled: false };
    if (!verifyTotp(user.totp_secret, code)) throw new ValidationError('Invalid authenticator code');
    await authModel.setTotp(userId, null, false);
    return { enabled: false };
  },
};
