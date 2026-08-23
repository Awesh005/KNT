import { pool } from '../../config/database';

export const paymentModel = {
  async createOrder(row: { donation_id: string; merchant_order_no: string; amount: number }) {
    await pool.query(
      'INSERT INTO payment_orders (donation_id, merchant_order_no, amount, status) VALUES (?, ?, ?, ?)',
      [row.donation_id, row.merchant_order_no, row.amount, 'created']
    );
  },

  async getByOrderNo(orderNo: string) {
    const [rows] = await pool.query('SELECT * FROM payment_orders WHERE merchant_order_no = ?', [orderNo]);
    return (rows as any[])[0] || null;
  },

  async getByDonation(donationId: string) {
    const [rows] = await pool.query(
      'SELECT * FROM payment_orders WHERE donation_id = ? ORDER BY id DESC LIMIT 1',
      [donationId]
    );
    return (rows as any[])[0] || null;
  },

  async updateOrder(orderNo: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE payment_orders SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE merchant_order_no = ?`,
      [...keys.map((key) => fields[key]), orderNo]
    );
  },

  async stampDonationGateway(donationId: string, fields: Record<string, any>) {
    const keys = Object.keys(fields);
    if (!keys.length) return;
    await pool.query(
      `UPDATE donations SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`,
      [...keys.map((key) => (key === 'gateway_payload' && typeof fields[key] === 'object' ? JSON.stringify(fields[key]) : fields[key])), donationId]
    );
  },
};
