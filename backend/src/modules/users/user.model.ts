import { pool } from '../../config/database';

export const userModel = {
  async getAllUsers(limit: number, offset: number) {
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile, role, status, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL');
    return {
      users: rows as any[],
      total: (totalRows as any[])[0].total
    };
  },

  async createAdmin(id: string, name: string, email: string, passwordHash: string) {
    const [result] = await pool.query(
      'INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, passwordHash, 'Admin', 'active']
    );
    return (result as any).affectedRows > 0;
  },

  async updateAdmin(id: string, email: string, passwordHash?: string) {
    if (passwordHash) {
      const [result] = await pool.query(
        'UPDATE users SET email = ?, password_hash = ? WHERE id = ? AND deleted_at IS NULL',
        [email, passwordHash, id]
      );
      return (result as any).affectedRows > 0;
    } else {
      const [result] = await pool.query(
        'UPDATE users SET email = ? WHERE id = ? AND deleted_at IS NULL',
        [email, id]
      );
      return (result as any).affectedRows > 0;
    }
  },

  async getUserById(id: string) {
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile, role, status, created_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return (rows as any[])[0] || null;
  },

  async updateUserRole(id: string, role: string) {
    const [result] = await pool.query(
      'UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL',
      [role, id]
    );
    return (result as any).affectedRows > 0;
  },

  async updateUserStatus(id: string, status: string) {
    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ? AND deleted_at IS NULL',
      [status, id]
    );
    return (result as any).affectedRows > 0;
  },

  async deleteUser(id: string) {
    const [result] = await pool.query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  },

  async getUserPasswordHash(id: string) {
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return (rows as any[])[0]?.password_hash || null;
  },

  async updateProfile(id: string, name: string, hashedPassword?: string) {
    if (hashedPassword) {
      const [result] = await pool.query(
        'UPDATE users SET name = ?, password_hash = ? WHERE id = ? AND deleted_at IS NULL',
        [name, hashedPassword, id]
      );
      return (result as any).affectedRows > 0;
    } else {
      const [result] = await pool.query(
        'UPDATE users SET name = ? WHERE id = ? AND deleted_at IS NULL',
        [name, id]
      );
      return (result as any).affectedRows > 0;
    }
  }
};
