"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactModel = exports.SDG_LABELS = void 0;
const database_1 = require("../../config/database");
exports.SDG_LABELS = {
    '1': 'No Poverty',
    '3': 'Good Health',
    '4': 'Quality Education',
    '5': 'Gender Equality',
    '6': 'Clean Water',
    '8': 'Decent Work',
    '10': 'Reduced Inequalities',
    '11': 'Sustainable Cities',
    '13': 'Climate Action',
    '17': 'Partnerships',
};
exports.impactModel = {
    async listBeneficiaries(filters) {
        const params = [];
        let query = `SELECT b.*, c.title AS campaign_title
      FROM beneficiaries b
      LEFT JOIN campaigns c ON c.id = b.campaign_id
      WHERE 1=1`;
        if (filters.campaign_id) {
            query += ' AND b.campaign_id = ?';
            params.push(filters.campaign_id);
        }
        query += ' ORDER BY b.created_at DESC';
        const [rows] = await database_1.pool.query(query, params);
        return rows.map((row) => ({
            ...row,
            details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details,
        }));
    },
    async createBeneficiary(data) {
        const [result] = await database_1.pool.query(`INSERT INTO beneficiaries (campaign_id, program_key, kind, name, age, gender, city, details, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.campaign_id || null,
            data.program_key || null,
            data.kind || 'other',
            data.name,
            data.age || null,
            data.gender || null,
            data.city || null,
            data.details ? JSON.stringify(data.details) : null,
            data.photo_url || null,
        ]);
        return result.insertId;
    },
    async deleteBeneficiary(id) {
        const [result] = await database_1.pool.query('DELETE FROM beneficiaries WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    async listUpdates(campaignId, publicOnly = false) {
        let query = 'SELECT * FROM campaign_updates WHERE campaign_id = ?';
        const params = [campaignId];
        if (publicOnly)
            query += ' AND is_public = 1';
        query += ' ORDER BY created_at DESC';
        const [rows] = await database_1.pool.query(query, params);
        return rows.map((row) => ({
            ...row,
            photo_urls: typeof row.photo_urls === 'string' ? JSON.parse(row.photo_urls) : (row.photo_urls || []),
        }));
    },
    async createUpdate(data) {
        const [result] = await database_1.pool.query(`INSERT INTO campaign_updates (campaign_id, title, body, photo_urls, is_public)
       VALUES (?, ?, ?, ?, ?)`, [data.campaign_id, data.title, data.body || null, JSON.stringify(data.photo_urls || []), data.is_public ? 1 : 0]);
        return result.insertId;
    },
    async deleteUpdate(id) {
        const [result] = await database_1.pool.query('DELETE FROM campaign_updates WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    async campaignMoney(campaignId) {
        const [[don]] = await database_1.pool.query(`SELECT COALESCE(SUM(amount), 0) AS raised, COUNT(*) AS gifts
       FROM donations WHERE campaign_id = ? AND status = 'verified'`, [campaignId]);
        const [[pay]] = await database_1.pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM payouts WHERE campaign_id = ? AND deleted_at IS NULL`, [campaignId]);
        const [[exp]] = await database_1.pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE campaign_id = ?`, [campaignId]);
        const [[budget]] = await database_1.pool.query(`SELECT COALESCE(SUM(allocated), 0) AS allocated FROM budgets WHERE campaign_id = ?`, [campaignId]);
        const raised = Number(don.raised) || 0;
        const payouts = Number(pay.total) || 0;
        const expenses = Number(exp.total) || 0;
        return {
            raised,
            gifts: Number(don.gifts) || 0,
            payouts,
            expenses,
            spent: payouts + expenses,
            remaining: raised - payouts - expenses,
            allocated: Number(budget.allocated) || 0,
        };
    },
    async sdgRollup() {
        const [rows] = await database_1.pool.query(`
      SELECT sdg_tags, COALESCE(SUM(raised_amount), 0) AS raised, COUNT(*) AS projects
      FROM campaigns
      WHERE deleted_at IS NULL AND sdg_tags IS NOT NULL AND sdg_tags <> ''
      GROUP BY sdg_tags
    `);
        const tally = {};
        for (const row of rows) {
            String(row.sdg_tags)
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .forEach((tag) => {
                tally[tag] = tally[tag] || { raised: 0, projects: 0 };
                tally[tag].raised += Number(row.raised) || 0;
                tally[tag].projects += Number(row.projects) || 0;
            });
        }
        return Object.entries(tally).map(([code, stats]) => ({
            code,
            label: exports.SDG_LABELS[code] || `SDG ${code}`,
            ...stats,
        }));
    },
    async csrRollup() {
        const [rows] = await database_1.pool.query(`
      SELECT
        LOWER(COALESCE(d.guest_email, u.email)) AS donor_key,
        MAX(COALESCE(d.guest_name, u.name)) AS name,
        COALESCE(SUM(d.amount), 0) AS given,
        COUNT(*) AS gifts,
        GROUP_CONCAT(DISTINCT c.title SEPARATOR ' | ') AS campaigns
      FROM donations d
      LEFT JOIN users u ON u.id = d.donor_id
      LEFT JOIN campaigns c ON c.id = d.campaign_id
      WHERE d.status = 'verified'
      GROUP BY donor_key
      ORDER BY given DESC
      LIMIT 50
    `);
        return rows;
    },
};
