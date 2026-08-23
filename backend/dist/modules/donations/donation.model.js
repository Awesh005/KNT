"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationModel = void 0;
const database_1 = require("../../config/database");
const donorSelect = `
  COALESCE(d.guest_name, u.name) as donor_name,
  COALESCE(d.guest_email, u.email) as donor_email,
  COALESCE(d.guest_phone, u.mobile) as donor_mobile
`;
exports.donationModel = {
    async createDonation(id, data) {
        await database_1.pool.query(`INSERT INTO donations (id, donor_id, campaign_id, amount, tip_amount, payment_ref, screenshot_url, status, guest_name, guest_email, guest_phone, guest_pan, guest_address, guest_city, guest_state, guest_pincode, payment_mode) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            data.donor_id,
            data.campaign_id || null,
            data.amount,
            data.tip_amount || 0,
            data.payment_ref || null,
            data.screenshot_url || null,
            'pending',
            data.guest_name || null,
            data.guest_email || null,
            data.guest_phone || null,
            data.guest_pan || null,
            data.guest_address || null,
            data.guest_city || null,
            data.guest_state || null,
            data.guest_pincode || null,
            data.payment_mode || 'UPI',
        ]);
        return id;
    },
    async getDonations(filters) {
        let query = `
      SELECT d.*, ${donorSelect}, u.role as donor_role, c.title as campaign_title, r.pdf_url as receipt_url, e.pdf_url as certificate_url, e.certificate_no
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN receipts r ON d.id = r.donation_id
      LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
      WHERE 1=1
    `;
        const params = [];
        if (filters.status) {
            query += ' AND d.status = ?';
            params.push(filters.status);
        }
        if (filters.donor_id) {
            query += ' AND d.donor_id = ?';
            params.push(filters.donor_id);
        }
        if (filters.campaign_id) {
            query += ' AND d.campaign_id = ?';
            params.push(filters.campaign_id);
        }
        const [totalRows] = await database_1.pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
        query += ' ORDER BY d.created_at DESC';
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset !== undefined) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }
        }
        const [rows] = await database_1.pool.query(query, params);
        return {
            donations: rows,
            total: totalRows[0].total
        };
    },
    async getDonationById(id) {
        const [rows] = await database_1.pool.query(`
      SELECT d.*, ${donorSelect}, u.role as donor_role, c.title as campaign_title, r.pdf_url as receipt_url, e.pdf_url as certificate_url, e.certificate_no
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      LEFT JOIN receipts r ON d.id = r.donation_id
      LEFT JOIN eighty_g_certificates e ON d.id = e.donation_id
      WHERE d.id = ?
    `, [id]);
        return rows[0] || null;
    },
    async getPublicStats() {
        const [[donationStats]] = await database_1.pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS totalRaised,
        COUNT(*) AS donationCount
      FROM donations
      WHERE status = 'verified'
    `);
        const [[campaignStats]] = await database_1.pool.query(`
      SELECT COUNT(*) AS activeCampaigns
      FROM campaigns
      WHERE status = 'approved' AND deleted_at IS NULL
    `);
        const [[donorStats]] = await database_1.pool.query(`
      SELECT COUNT(DISTINCT COALESCE(donor_id, guest_email, id)) AS donorCount
      FROM donations
      WHERE status = 'verified'
    `);
        const [[lastGift]] = await database_1.pool.query(`
      SELECT d.amount,
        COALESCE(NULLIF(d.guest_name, ''), u.name, 'A supporter') AS name,
        COALESCE(d.donated_at, d.created_at) AS at
      FROM donations d
      LEFT JOIN users u ON u.id = d.donor_id
      WHERE d.status = 'verified'
      ORDER BY COALESCE(d.donated_at, d.created_at) DESC
      LIMIT 1
    `);
        let beneficiaryCount = 0;
        try {
            const [[peopleStats]] = await database_1.pool.query(`SELECT COUNT(*) AS beneficiaryCount FROM beneficiaries`);
            beneficiaryCount = Number(peopleStats?.beneficiaryCount) || 0;
        }
        catch {
            beneficiaryCount = 0;
        }
        const firstName = lastGift?.name ? String(lastGift.name).trim().split(/\s+/)[0] : null;
        return {
            totalRaised: Number(donationStats.totalRaised) || 0,
            donationCount: Number(donationStats.donationCount) || 0,
            activeCampaigns: Number(campaignStats.activeCampaigns) || 0,
            donorCount: Number(donorStats.donorCount) || 0,
            beneficiaryCount,
            lastGift: lastGift ? {
                amount: Number(lastGift.amount) || 0,
                name: firstName || 'A supporter',
                at: lastGift.at,
            } : null,
        };
    },
    async updateDonationStatus(id, status) {
        const [result] = await database_1.pool.query('UPDATE donations SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },
    async deleteDonation(id) {
        const [result] = await database_1.pool.query('DELETE FROM donations WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
