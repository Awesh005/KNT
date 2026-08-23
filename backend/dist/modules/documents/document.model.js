"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentModel = void 0;
const database_1 = require("../../config/database");
const fy_1 = require("../../utils/fy");
exports.documentModel = {
    async nextReceiptNumber() {
        const fy = (0, fy_1.getIndianFY)();
        await database_1.pool.query(`INSERT INTO receipt_counters (fy, last_no) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE last_no = last_no + 1`, [fy]);
        const [rows] = await database_1.pool.query('SELECT last_no FROM receipt_counters WHERE fy = ?', [fy]);
        const serial = String(rows[0].last_no).padStart(4, '0');
        return `KNT/REC/FY${fy}/${serial}`;
    },
    async saveReceipt(id, donationId, receiptNo, pdfUrl) {
        const [result] = await database_1.pool.query(`INSERT INTO receipts (id, donation_id, receipt_no, pdf_url) VALUES (?, ?, ?, ?)`, [id, donationId, receiptNo, pdfUrl]);
        return id;
    },
    async getReceiptByDonationId(donationId) {
        const [rows] = await database_1.pool.query('SELECT * FROM receipts WHERE donation_id = ?', [donationId]);
        return rows[0] || null;
    },
    async save80GCertificate(id, donationId, certificateNo, pdfUrl) {
        const [result] = await database_1.pool.query(`INSERT INTO eighty_g_certificates (id, donation_id, certificate_no, pdf_url) VALUES (?, ?, ?, ?)`, [id, donationId, certificateNo, pdfUrl]);
        return id;
    },
    async get80GCertificateByDonationId(donationId) {
        const [rows] = await database_1.pool.query('SELECT * FROM eighty_g_certificates WHERE donation_id = ?', [donationId]);
        return rows[0] || null;
    },
    async delete80GCertificateByDonationId(donationId) {
        const [result] = await database_1.pool.query('DELETE FROM eighty_g_certificates WHERE donation_id = ?', [donationId]);
        return result.affectedRows > 0;
    },
};
