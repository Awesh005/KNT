import { pool } from '../../config/database';

export const requestModel = {
  async createRequest(id: string, userId: string, data: any) {
    const documentsString = JSON.stringify(data.documents || []);
    const coverImagesString = JSON.stringify(data.cover_images || []);
    const [result] = await pool.query(
      `INSERT INTO fundraiser_requests (id, user_id, beneficiary_name, category, story, target_amount, deadline, cover_images, documents, status, account_holder_name, account_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, data.beneficiary_name, data.category, data.story, 
        data.target_amount, new Date(data.deadline).toISOString().slice(0, 19).replace('T', ' '), coverImagesString, documentsString, 'pending',
        data.account_holder_name || null, data.account_number || null
      ]
    );
    return id;
  },

  async getRequests(filters: { status?: string; user_id?: string; limit?: number; offset?: number }) {
    let query = `
      SELECT r.*, u.name as requester_name, u.email as requester_email, u.mobile as requester_mobile
      FROM fundraiser_requests r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }
    if (filters.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);

    query += ' ORDER BY r.created_at DESC';

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
      requests: rows as any[],
      total: (totalRows as any[])[0].total
    };
  },

  async getRequestById(id: string) {
    const [rows] = await pool.query(`
      SELECT r.*, u.name as requester_name, u.email as requester_email, u.mobile as requester_mobile
      FROM fundraiser_requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);
    return (rows as any[])[0] || null;
  },

  async updateRequestStatus(id: string, status: string, adminRemarks?: string) {
    const [result] = await pool.query(
      'UPDATE fundraiser_requests SET status = ?, admin_remarks = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, adminRemarks || null, id]
    );
    return (result as any).affectedRows > 0;
  }
};
