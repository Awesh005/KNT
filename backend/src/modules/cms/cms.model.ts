import { pool } from '../../config/database';

export const cmsModel = {
  async getContent(pageKey: string, sectionKey: string) {
    const [rows] = await pool.query(
      'SELECT content, updated_by, updated_at FROM cms_content WHERE page_key = ? AND section_key = ?',
      [pageKey, sectionKey]
    );
    const row = (rows as any[])[0];
    if (row && typeof row.content === 'string') {
      try {
        row.content = JSON.parse(row.content);
      } catch (e) {
        console.error('Failed to parse CMS content:', e);
      }
    }
    return row || null;
  },

  async upsertContent(pageKey: string, sectionKey: string, content: any, updatedBy: string) {
    const contentString = JSON.stringify(content);
    const [result] = await pool.query(
      `INSERT INTO cms_content (page_key, section_key, content, updated_by) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), updated_by = VALUES(updated_by)`,
      [pageKey, sectionKey, contentString, updatedBy]
    );
    return (result as any).affectedRows > 0;
  }
};
