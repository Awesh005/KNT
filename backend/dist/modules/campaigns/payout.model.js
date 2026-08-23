"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutModel = void 0;
const database_1 = require("../../config/database");
exports.payoutModel = {
    async createPayout(data) {
        const [result] = await database_1.pool.query(`INSERT INTO payouts (campaign_id, amount, transfer_date, account_holder, account_details, transferred_to)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            data.campaign_id,
            data.amount,
            data.transfer_date,
            data.account_holder,
            data.account_details,
            data.transferred_to
        ]);
        return result.insertId;
    },
    async getPayoutsByCampaign(campaignId) {
        const [rows] = await database_1.pool.query('SELECT * FROM payouts WHERE campaign_id = ? AND deleted_at IS NULL ORDER BY transfer_date DESC', [campaignId]);
        return rows;
    },
    async deletePayout(id) {
        const [result] = await database_1.pool.query('UPDATE payouts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
