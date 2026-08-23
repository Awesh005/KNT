import { pool } from '../../config/database';

export const enquiryModel = {
  async createEnquiry(data: { name: string; email: string; phone?: string; message: string }) {
    const [result] = await pool.query(
      `INSERT INTO enquiries (name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.email, data.phone || null, data.message, 'new']
    );
    return (result as any).insertId;
  },

  async getEnquiries(filters: { status?: string; limit?: number; offset?: number }) {
    let query = 'SELECT * FROM enquiries WHERE 1=1';
    const params: any[] = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset !== undefined) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const [rows] = await pool.query(query, params);
    
    return {
      enquiries: rows as any[],
      total: (totalRows as any[])[0].total
    };
  },

  async getEnquiryById(id: number) {
    const [rows] = await pool.query('SELECT * FROM enquiries WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async updateEnquiryStatus(id: number, status: string) {
    const [result] = await pool.query(
      'UPDATE enquiries SET status = ? WHERE id = ?',
      [status, id]
    );
    return (result as any).affectedRows > 0;
  },

  async deleteEnquiry(id: number) {
    const [result] = await pool.query('DELETE FROM enquiries WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
};
