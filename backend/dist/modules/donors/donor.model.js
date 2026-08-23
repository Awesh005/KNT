"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donorModel = void 0;
const database_1 = require("../../config/database");
const fy_1 = require("../../utils/fy");
const donorKeyExpr = `LOWER(COALESCE(d.guest_email, u.email))`;
exports.donorModel = {
    async listDonors(filters) {
        const params = [];
        let fyJoin = '';
        if (filters.fy) {
            const { from, to } = (0, fy_1.getFyRange)(filters.fy);
            fyJoin = ' AND d.donated_at >= ? AND d.donated_at < DATE_ADD(?, INTERVAL 1 DAY)';
            params.push(from, to);
        }
        let query = `
      SELECT
        ${donorKeyExpr} AS donorKey,
        MAX(COALESCE(d.guest_name, u.name)) AS name,
        MAX(COALESCE(d.guest_email, u.email)) AS email,
        MAX(COALESCE(d.guest_phone, u.mobile)) AS phone,
        MAX(d.guest_pan) AS pan,
        MAX(d.guest_address) AS address,
        MAX(d.guest_city) AS city,
        MAX(d.guest_state) AS state,
        COUNT(*) AS giftCount,
        COALESCE(SUM(d.amount), 0) AS totalGiven,
        MAX(d.donated_at) AS lastGiftAt,
        MAX(CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END) AS has80G
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
      WHERE d.status = 'verified'
        AND ${donorKeyExpr} IS NOT NULL
        AND ${donorKeyExpr} <> ''
        ${fyJoin}
      GROUP BY donorKey
    `;
        if (filters.search) {
            query = `SELECT * FROM (${query}) donors WHERE name LIKE ? OR email LIKE ? OR pan LIKE ? OR phone LIKE ?`;
            const like = `%${filters.search}%`;
            params.push(like, like, like, like);
        }
        query += ' ORDER BY lastGiftAt DESC';
        const [rows] = await database_1.pool.query(query, params);
        let donors = rows;
        if (filters.tag) {
            const [tagged] = await database_1.pool.query('SELECT donor_key FROM donor_tags WHERE tag = ?', [filters.tag]);
            const keys = new Set(tagged.map((row) => row.donor_key));
            donors = donors.filter((donor) => keys.has(donor.donorKey));
        }
        const keys = donors.map((donor) => donor.donorKey);
        let tagMap = {};
        if (keys.length > 0) {
            const [tagRows] = await database_1.pool.query(`SELECT donor_key, tag FROM donor_tags WHERE donor_key IN (${keys.map(() => '?').join(',')})`, keys);
            tagMap = tagRows.reduce((acc, row) => {
                acc[row.donor_key] = acc[row.donor_key] || [];
                acc[row.donor_key].push(row.tag);
                return acc;
            }, {});
        }
        return donors.map((donor) => ({
            ...donor,
            totalGiven: Number(donor.totalGiven) || 0,
            giftCount: Number(donor.giftCount) || 0,
            has80G: Boolean(Number(donor.has80G)),
            tags: tagMap[donor.donorKey] || [],
        }));
    },
    async getDonorProfile(donorKey) {
        const key = (0, fy_1.normalizeDonorKey)(donorKey);
        const [summaryRows] = await database_1.pool.query(`SELECT
         ${donorKeyExpr} AS donorKey,
         MAX(COALESCE(d.guest_name, u.name)) AS name,
         MAX(COALESCE(d.guest_email, u.email)) AS email,
         MAX(COALESCE(d.guest_phone, u.mobile)) AS phone,
         MAX(d.guest_pan) AS pan,
         MAX(d.guest_address) AS address,
         MAX(d.guest_city) AS city,
         MAX(d.guest_state) AS state,
         MAX(d.guest_pincode) AS pincode,
         COUNT(*) AS giftCount,
         COALESCE(SUM(d.amount), 0) AS totalGiven,
         MAX(d.donated_at) AS lastGiftAt,
         MAX(CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END) AS has80G
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
       WHERE d.status = 'verified' AND ${donorKeyExpr} = ?
       GROUP BY donorKey`, [key]);
        const profile = summaryRows[0];
        if (!profile)
            return null;
        const [gifts] = await database_1.pool.query(`SELECT d.id, d.amount, d.tip_amount, d.donated_at, d.payment_ref, d.payment_mode, d.guest_pan,
              d.guest_address, d.guest_city, d.status,
              c.title AS campaign_title, r.receipt_no, r.pdf_url AS receipt_url,
              e.certificate_no, e.pdf_url AS certificate_url
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN receipts r ON d.id = r.donation_id
       LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
       WHERE ${donorKeyExpr} = ?
       ORDER BY d.donated_at DESC`, [key]);
        const [notes] = await database_1.pool.query('SELECT * FROM donor_notes WHERE donor_key = ? ORDER BY created_at DESC', [key]);
        const [tags] = await database_1.pool.query('SELECT tag FROM donor_tags WHERE donor_key = ? ORDER BY tag', [key]);
        return {
            ...profile,
            totalGiven: Number(profile.totalGiven) || 0,
            giftCount: Number(profile.giftCount) || 0,
            has80G: Boolean(Number(profile.has80G)),
            tags: tags.map((row) => row.tag),
            gifts,
            notes,
        };
    },
    async addNote(donorKey, data) {
        const [result] = await database_1.pool.query('INSERT INTO donor_notes (donor_key, author_id, author_name, note, follow_up_at) VALUES (?, ?, ?, ?, ?)', [(0, fy_1.normalizeDonorKey)(donorKey), data.author_id || null, data.author_name || null, data.note, data.follow_up_at || null]);
        return result.insertId;
    },
    async setTags(donorKey, tags) {
        const key = (0, fy_1.normalizeDonorKey)(donorKey);
        await database_1.pool.query('DELETE FROM donor_tags WHERE donor_key = ?', [key]);
        const unique = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
        for (const tag of unique) {
            await database_1.pool.query('INSERT INTO donor_tags (donor_key, tag) VALUES (?, ?)', [key, tag]);
        }
        return unique;
    },
    async getGiftsForFy(donorKey, fy) {
        const { from, to } = (0, fy_1.getFyRange)(fy);
        const [rows] = await database_1.pool.query(`SELECT d.id, d.amount, d.donated_at, d.guest_pan, c.title AS campaign_title, r.receipt_no, e.certificate_no
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN receipts r ON d.id = r.donation_id
       LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
       WHERE d.status = 'verified'
         AND ${donorKeyExpr} = ?
         AND d.donated_at >= ? AND d.donated_at < DATE_ADD(?, INTERVAL 1 DAY)
       ORDER BY d.donated_at ASC`, [(0, fy_1.normalizeDonorKey)(donorKey), from, to]);
        return rows;
    },
    async saveStatement(donorKey, fy, pdfUrl) {
        await database_1.pool.query(`INSERT INTO annual_statements (donor_key, fy, pdf_url)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE pdf_url = VALUES(pdf_url), emailed_at = NULL`, [(0, fy_1.normalizeDonorKey)(donorKey), fy, pdfUrl]);
    },
    async markStatementEmailed(donorKey, fy) {
        await database_1.pool.query('UPDATE annual_statements SET emailed_at = NOW() WHERE donor_key = ? AND fy = ?', [(0, fy_1.normalizeDonorKey)(donorKey), fy]);
    },
    async getStatement(donorKey, fy) {
        const [rows] = await database_1.pool.query('SELECT * FROM annual_statements WHERE donor_key = ? AND fy = ?', [(0, fy_1.normalizeDonorKey)(donorKey), fy]);
        return rows[0] || null;
    },
};
