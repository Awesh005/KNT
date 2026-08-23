import { pool } from '../../config/database';

export const payoutModel = {
  async createPayout(data: any) {
    const [result] = await pool.query(
      `INSERT INTO payouts (campaign_id, amount, transfer_date, account_holder, account_details, transferred_to)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.campaign_id,
        data.amount,
        data.transfer_date,
        data.account_holder,
        data.account_details,
        data.transferred_to
      ]
    );
    return (result as any).insertId;
  },

  async getPayoutsByCampaign(campaignId: number) {
    const [rows] = await pool.query(
      'SELECT * FROM payouts WHERE campaign_id = ? AND deleted_at IS NULL ORDER BY transfer_date DESC',
      [campaignId]
    );
    return rows as any[];
  },

  async deletePayout(id: number) {
    const [result] = await pool.query(
      'UPDATE payouts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    return (result as any).affectedRows > 0;
  }
};
