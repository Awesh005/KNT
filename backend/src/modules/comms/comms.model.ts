import { pool } from '../../config/database';

export const commsModel = {
  async listTemplates() {
    const [rows] = await pool.query('SELECT * FROM mail_templates ORDER BY name');
    return rows as any[];
  },

  async getTemplate(key: string) {
    const [rows] = await pool.query('SELECT * FROM mail_templates WHERE template_key = ?', [key]);
    return (rows as any[])[0] || null;
  },

  async updateTemplate(key: string, data: { subject?: string; html?: string; name?: string }) {
    await pool.query(
      'UPDATE mail_templates SET subject = COALESCE(?, subject), html = COALESCE(?, html), name = COALESCE(?, name) WHERE template_key = ?',
      [data.subject || null, data.html || null, data.name || null, key]
    );
    return this.getTemplate(key);
  },

  async log(row: { template_key?: string | null; recipient: string; subject: string; status: string; error?: string | null }) {
    await pool.query(
      'INSERT INTO mail_log (template_key, recipient, subject, status, error) VALUES (?, ?, ?, ?, ?)',
      [row.template_key || null, row.recipient, row.subject, row.status, row.error || null]
    );
  },

  async listLog(limit = 100) {
    const [rows] = await pool.query('SELECT * FROM mail_log ORDER BY created_at DESC LIMIT ?', [limit]);
    return rows as any[];
  },
};
