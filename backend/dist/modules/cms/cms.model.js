"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsModel = void 0;
const database_1 = require("../../config/database");
exports.cmsModel = {
    async getContent(pageKey, sectionKey) {
        const [rows] = await database_1.pool.query('SELECT content, updated_by, updated_at FROM cms_content WHERE page_key = ? AND section_key = ?', [pageKey, sectionKey]);
        const row = rows[0];
        if (row && typeof row.content === 'string') {
            try {
                row.content = JSON.parse(row.content);
            }
            catch (e) {
                console.error('Failed to parse CMS content:', e);
            }
        }
        return row || null;
    },
    async upsertContent(pageKey, sectionKey, content, updatedBy) {
        const contentString = JSON.stringify(content);
        const [result] = await database_1.pool.query(`INSERT INTO cms_content (page_key, section_key, content, updated_by) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), updated_by = VALUES(updated_by)`, [pageKey, sectionKey, contentString, updatedBy]);
        return result.affectedRows > 0;
    }
};
