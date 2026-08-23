"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentModel = void 0;
const database_1 = require("../../config/database");
exports.paymentModel = {
    async createOrder(row) {
        await database_1.pool.query('INSERT INTO payment_orders (donation_id, merchant_order_no, amount, status) VALUES (?, ?, ?, ?)', [row.donation_id, row.merchant_order_no, row.amount, 'created']);
    },
    async getByOrderNo(orderNo) {
        const [rows] = await database_1.pool.query('SELECT * FROM payment_orders WHERE merchant_order_no = ?', [orderNo]);
        return rows[0] || null;
    },
    async getByDonation(donationId) {
        const [rows] = await database_1.pool.query('SELECT * FROM payment_orders WHERE donation_id = ? ORDER BY id DESC LIMIT 1', [donationId]);
        return rows[0] || null;
    },
    async updateOrder(orderNo, fields) {
        const keys = Object.keys(fields);
        if (!keys.length)
            return;
        await database_1.pool.query(`UPDATE payment_orders SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE merchant_order_no = ?`, [...keys.map((key) => fields[key]), orderNo]);
    },
    async stampDonationGateway(donationId, fields) {
        const keys = Object.keys(fields);
        if (!keys.length)
            return;
        await database_1.pool.query(`UPDATE donations SET ${keys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`, [...keys.map((key) => (key === 'gateway_payload' && typeof fields[key] === 'object' ? JSON.stringify(fields[key]) : fields[key])), donationId]);
    },
};
