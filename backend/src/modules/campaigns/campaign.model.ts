import { pool } from '../../config/database';

function parseCampaignRow(row: any) {
  if (!row) return row;
  if (typeof row.cover_image === 'string') {
    if (row.cover_image.startsWith('[')) {
      try {
        row.cover_image = JSON.parse(row.cover_image);
      } catch (e) {
        row.cover_image = [row.cover_image];
      }
    } else if (row.cover_image) {
      row.cover_image = [row.cover_image];
    } else {
      row.cover_image = [];
    }
  }
  if (typeof row.student_details === 'string') {
    try {
      row.student_details = JSON.parse(row.student_details);
    } catch (e) {
      row.student_details = null;
    }
  }
  if (typeof row.sdg_tags === 'string') {
    row.sdg_tags = row.sdg_tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
  } else if (!row.sdg_tags) {
    row.sdg_tags = [];
  }
  if (row.latitude != null) row.latitude = Number(row.latitude);
  if (row.longitude != null) row.longitude = Number(row.longitude);
  return row;
}

export const campaignModel = {
  async createCampaign(data: any) {
    const [result] = await pool.query(
      `INSERT INTO campaigns (title, category, story, cover_image, documents, target_amount, deadline, created_by, status, is_urgent, is_featured, video_url, account_holder_name, account_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title, data.category, data.story, 
        Array.isArray(data.cover_image) ? JSON.stringify(data.cover_image) : data.cover_image, 
        data.documents ? (typeof data.documents === 'string' ? data.documents : JSON.stringify(data.documents)) : null,
        data.target_amount, 
        new Date(data.deadline).toISOString().slice(0, 19).replace('T', ' '), data.created_by, data.status || 'pending', 
        data.is_urgent || false, data.is_featured || false, data.video_url || null,
        data.account_holder_name || null, data.account_number || null
      ]
    );
    return (result as any).insertId;
  },

  async getCampaigns(filters: { is_urgent?: boolean; is_featured?: boolean; status?: string; category?: string; limit?: number; offset?: number }) {
    let query = 'SELECT c.*, u.name as creator_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.deleted_at IS NULL';
    const params: any[] = [];

    if (filters.is_urgent !== undefined) {
      query += ' AND c.is_urgent = ?';
      params.push(filters.is_urgent);
    }
    if (filters.is_featured !== undefined) {
      query += ' AND c.is_featured = ?';
      params.push(filters.is_featured);
    }
    if (filters.status !== undefined) {
      query += ' AND c.status = ?';
      params.push(filters.status);
    }
    if (filters.category !== undefined) {
      query += ' AND c.category = ?';
      params.push(filters.category);
    }

    // Count query before applying limit/offset
    const [totalRows] = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);

    query += ' ORDER BY c.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset !== undefined) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const [rows] = await pool.query(query, params);
    
    const parsedRows = (rows as any[]).map(parseCampaignRow);

    return {
      campaigns: parsedRows,
      total: (totalRows as any[])[0].total
    };
  },

  async getCampaignById(id: number) {
    const [rows] = await pool.query(
      'SELECT c.*, u.name as creator_name FROM campaigns c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ? AND c.deleted_at IS NULL', 
      [id]
    );
    return parseCampaignRow((rows as any[])[0] || null);
  },

  async updateCampaign(id: number, data: any) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        if (key === 'cover_image' && Array.isArray(value)) {
          values.push(JSON.stringify(value));
        } else if (key === 'student_details' && value && typeof value === 'object') {
          values.push(JSON.stringify(value));
        } else if (key === 'sdg_tags' && Array.isArray(value)) {
          values.push(value.join(','));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return true;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE campaigns SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return (result as any).affectedRows > 0;
  },

  async deleteCampaign(id: number) {
    const [result] = await pool.query('UPDATE campaigns SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }
};
