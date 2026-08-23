import { pool } from '../../config/database';
import { getIndianFY } from '../../utils/fy';

export const officeModel = {
  async nextLetterNo() {
    const fy = getIndianFY();
    const kind = `letter-${fy}`;
    await pool.query(
      `INSERT INTO people_counters (kind, last_no) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE last_no = last_no + 1`,
      [kind]
    );
    const [rows] = await pool.query('SELECT last_no FROM people_counters WHERE kind = ?', [kind]);
    const serial = String((rows as any[])[0].last_no).padStart(4, '0');
    return `KNT-LTR-FY${fy}-${serial}`;
  },

  async listFiles(filters: { search?: string; folder?: string }) {
    const params: any[] = [];
    let query = `SELECT m.*, u.name AS uploaded_by_name
      FROM media_files m
      LEFT JOIN users u ON u.id = m.uploaded_by
      WHERE 1=1`;
    if (filters.folder) {
      query += ' AND m.folder = ?';
      params.push(filters.folder);
    }
    if (filters.search) {
      query += ' AND (m.title LIKE ? OR m.original_name LIKE ? OR m.filename LIKE ? OR m.folder LIKE ?)';
      const like = `%${filters.search}%`;
      params.push(like, like, like, like);
    }
    query += ' ORDER BY m.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getFile(id: string) {
    const [rows] = await pool.query('SELECT * FROM media_files WHERE id = ?', [id]);
    return (rows as any[])[0] || null;
  },

  async saveFile(row: any) {
    await pool.query(
      `INSERT INTO media_files (id, filename, original_name, path, url, mime_type, size_bytes, uploaded_by, folder, title, visibility, allowed_roles, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.filename, row.original_name, row.path, row.url, row.mime_type, row.size_bytes, row.uploaded_by, row.folder, row.title, row.visibility, row.allowed_roles, row.description]
    );
  },

  async updateFile(id: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE media_files SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => fields[key]), id]
    );
  },

  async deleteFile(id: string) {
    const [result] = await pool.query('DELETE FROM media_files WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  },

  async folders() {
    const [rows] = await pool.query('SELECT DISTINCT folder FROM media_files WHERE folder IS NOT NULL ORDER BY folder');
    return (rows as any[]).map((row) => row.folder);
  },

  listTemplates() {
    return pool.query('SELECT * FROM letter_templates ORDER BY name').then(([rows]) => rows as any[]);
  },

  async createTemplate(data: { name: string; subject: string; body: string }) {
    const [result] = await pool.query(
      'INSERT INTO letter_templates (name, subject, body) VALUES (?, ?, ?)',
      [data.name, data.subject, data.body]
    );
    return (result as any).insertId;
  },

  async saveLetter(row: any) {
    await pool.query(
      `INSERT INTO letters (id, letter_no, template_id, subject, body, addressee_name, addressee_email, addressee_phone, pdf_url, verify_code, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'dispatched', ?)`,
      [row.id, row.letter_no, row.template_id, row.subject, row.body, row.addressee_name, row.addressee_email, row.addressee_phone, row.pdf_url, row.verify_code, row.created_by]
    );
  },

  async listLetters(search?: string) {
    const params: any[] = [];
    let query = 'SELECT * FROM letters WHERE 1=1';
    if (search) {
      query += ' AND (letter_no LIKE ? OR subject LIKE ? OR addressee_name LIKE ? OR verify_code LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    query += ' ORDER BY dispatched_at DESC';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getLetter(id: string) {
    const [rows] = await pool.query('SELECT * FROM letters WHERE id = ? OR letter_no = ? OR verify_code = ?', [id, id, id]);
    return (rows as any[])[0] || null;
  },

  async logSend(letterId: string, channel: string, recipient: string, status: string, notes?: string) {
    await pool.query(
      'INSERT INTO letter_sends (letter_id, channel, recipient, status, notes) VALUES (?, ?, ?, ?, ?)',
      [letterId, channel, recipient, status, notes || null]
    );
  },

  async listSends(letterId?: string) {
    const params: any[] = [];
    let query = `SELECT s.*, l.letter_no, l.subject
      FROM letter_sends s JOIN letters l ON l.id = s.letter_id WHERE 1=1`;
    if (letterId) {
      query += ' AND s.letter_id = ?';
      params.push(letterId);
    }
    query += ' ORDER BY s.created_at DESC LIMIT 100';
    const [rows] = await pool.query(query, params);
    return rows as any[];
  },

  async getSeal() {
    const [rows] = await pool.query('SELECT seal_url FROM office_settings WHERE id = 1');
    return (rows as any[])[0]?.seal_url || null;
  },

  async setSeal(url: string) {
    await pool.query('UPDATE office_settings SET seal_url = ? WHERE id = 1', [url]);
  },

  async findEightyG(code: string) {
    const slashed = code.replace(/-/g, '/');
    const [rows] = await pool.query(
      `SELECT e.*, d.guest_name, d.guest_email, d.amount, d.donated_at
       FROM eighty_g_certificates e
       JOIN donations d ON d.id = e.donation_id
       WHERE e.certificate_no = ? OR e.certificate_no = ? OR REPLACE(e.certificate_no, '/', '-') = ?`,
      [code, slashed, code]
    );
    return (rows as any[])[0] || null;
  },
};
