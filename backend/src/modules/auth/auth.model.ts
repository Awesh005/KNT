import { pool } from '../../config/database';

export const authModel = {
  async createUser(id: string, name: string, email: string, passwordHash: string, extra: { email_verified?: number; email_verify_token?: string | null } = {}) {
    const [result] = await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role, status, email_verified, email_verify_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, 'Donor', 'active', extra.email_verified ?? 0, extra.email_verify_token || null]
    );
    return result;
  },

  async findUserByEmail(email: string) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
      [email]
    );
    return (rows as any[])[0] || null;
  },

  async findUserById(id: string) {
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile, role, status, email_verified, totp_enabled FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return (rows as any[])[0] || null;
  },

  async findUserAuthById(id: string) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return (rows as any[])[0] || null;
  },

  async setEmailVerified(token: string) {
    const [result] = await pool.query(
      'UPDATE users SET email_verified = 1, email_verify_token = NULL WHERE email_verify_token = ? AND deleted_at IS NULL',
      [token]
    );
    return (result as any).affectedRows > 0;
  },

  async setTotp(userId: string, secret: string | null, enabled: boolean) {
    await pool.query('UPDATE users SET totp_secret = ?, totp_enabled = ? WHERE id = ?', [secret, enabled ? 1 : 0, userId]);
  },

  async updatePassword(userId: string, passwordHash: string) {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ? AND deleted_at IS NULL',
      [passwordHash, userId]
    );
    return (result as any).affectedRows > 0;
  },

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [userId]);
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  },

  async findValidResetToken(token: string) {
    const [rows] = await pool.query(
      `SELECT prt.*, u.email, u.name
       FROM password_reset_tokens prt
       JOIN users u ON u.id = prt.user_id
       WHERE prt.token = ? AND prt.used_at IS NULL AND prt.expires_at > NOW() AND u.deleted_at IS NULL`,
      [token]
    );
    return (rows as any[])[0] || null;
  },

  async markResetTokenUsed(token: string) {
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token = ?', [token]);
  },
};
