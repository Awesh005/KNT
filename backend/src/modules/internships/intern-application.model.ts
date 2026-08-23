import { pool } from '../../config/database';

export const internApplicationModel = {
  async create(data: {
    internship_id: string;
    internship_title: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    course: string;
    year?: string;
    duration?: string;
    message?: string;
    resume_url?: string | null;
  }) {
    const [result] = await pool.query(
      `INSERT INTO intern_applications
        (internship_id, internship_title, name, email, phone, college, course, year, duration, message, resume_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        data.internship_id,
        data.internship_title,
        data.name,
        data.email,
        data.phone,
        data.college,
        data.course,
        data.year || null,
        data.duration || null,
        data.message || null,
        data.resume_url || null,
      ]
    );
    return (result as any).insertId;
  },

  async list(status?: string) {
    const params: any[] = [];
    let query = 'SELECT * FROM intern_applications WHERE 1=1';
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getById(id: number) {
    const [rows] = await pool.query('SELECT * FROM intern_applications WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async updateStatus(id: number, status: string) {
    const [result] = await pool.query('UPDATE intern_applications SET status = ? WHERE id = ?', [status, id]);
    return (result as any).affectedRows > 0;
  },

  async remove(id: number) {
    const [result] = await pool.query('DELETE FROM intern_applications WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },
};
