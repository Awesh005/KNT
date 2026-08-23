import { pool } from '../../config/database';

import { getIndianFY } from '../../utils/fy';

export const documentModel = {
  async nextReceiptNumber() {
    const fy = getIndianFY();
    await pool.query(
      `INSERT INTO receipt_counters (fy, last_no) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE last_no = last_no + 1`,
      [fy]
    );
    const [rows] = await pool.query('SELECT last_no FROM receipt_counters WHERE fy = ?', [fy]);
    const serial = String((rows as any[])[0].last_no).padStart(4, '0');
    return `KNT/REC/FY${fy}/${serial}`;
  },
  async saveReceipt(id: string, donationId: string, receiptNo: string, pdfUrl: string) {
    const [result] = await pool.query(
      `INSERT INTO receipts (id, donation_id, receipt_no, pdf_url) VALUES (?, ?, ?, ?)`,
      [id, donationId, receiptNo, pdfUrl]
    );
    return id;
  },

  async getReceiptByDonationId(donationId: string) {
    const [rows] = await pool.query('SELECT * FROM receipts WHERE donation_id = ?', [donationId]);
    return (rows as any[])[0] || null;
  },

  async save80GCertificate(id: string, donationId: string, certificateNo: string, pdfUrl: string) {
    const [result] = await pool.query(
      `INSERT INTO eighty_g_certificates (id, donation_id, certificate_no, pdf_url) VALUES (?, ?, ?, ?)`,
      [id, donationId, certificateNo, pdfUrl]
    );
    return id;
  },

  async get80GCertificateByDonationId(donationId: string) {
    const [rows] = await pool.query('SELECT * FROM eighty_g_certificates WHERE donation_id = ?', [donationId]);
    return (rows as any[])[0] || null;
  },

  async delete80GCertificateByDonationId(donationId: string) {
    const [result] = await pool.query('DELETE FROM eighty_g_certificates WHERE donation_id = ?', [donationId]);
    return (result as any).affectedRows > 0;
  },
};
