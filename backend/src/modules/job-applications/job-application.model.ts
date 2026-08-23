import { pool } from '../../config/database';

export const jobApplicationModel = {
  async createApplication(data: {
    job_id: string;
    job_title: string;
    name: string;
    email: string;
    phone: string;
    qualification: string;
    experience?: string;
    documents: Record<string, string>;
  }) {
    const [result] = await pool.query(
      `INSERT INTO job_applications (job_id, job_title, name, email, phone, qualification, experience, documents, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        data.job_id,
        data.job_title,
        data.name,
        data.email,
        data.phone,
        data.qualification,
        data.experience || null,
        JSON.stringify(data.documents),
      ]
    );
    return (result as any).insertId;
  },

  async getApplications(filters: { status?: string; limit?: number; offset?: number }) {
    let query = 'SELECT * FROM job_applications WHERE 1=1';
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
    const applications = (rows as any[]).map((row) => ({
      ...row,
      documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents,
    }));

    return {
      applications,
      total: (totalRows as any[])[0].total,
    };
  },

  async getApplicationById(id: number) {
    const [rows] = await pool.query('SELECT * FROM job_applications WHERE id = ?', [id]);
    const row = (rows as any[])[0];
    if (!row) return null;
    return {
      ...row,
      documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents,
    };
  },

  async updateApplicationStatus(id: number, status: string) {
    const [result] = await pool.query(
      'UPDATE job_applications SET status = ? WHERE id = ?',
      [status, id]
    );
    return (result as any).affectedRows > 0;
  },

  async deleteApplication(id: number) {
    const [result] = await pool.query('DELETE FROM job_applications WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },

  async countByStatus(status: string) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM job_applications WHERE status = ?',
      [status]
    );
    return (rows as any[])[0].total;
  },
};
