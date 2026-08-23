"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enquiryModel = void 0;
const database_1 = require("../../config/database");
exports.enquiryModel = {
    async createEnquiry(data) {
        const [result] = await database_1.pool.query(`INSERT INTO enquiries (name, email, phone, message, status) VALUES (?, ?, ?, ?, ?)`, [data.name, data.email, data.phone || null, data.message, 'new']);
        return result.insertId;
    },
    async getEnquiries(filters) {
        let query = 'SELECT * FROM enquiries WHERE 1=1';
        const params = [];
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        const [totalRows] = await database_1.pool.query(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
        query += ' ORDER BY created_at DESC';
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
            enquiries: rows,
            total: totalRows[0].total
        };
    },
    async getEnquiryById(id) {
        const [rows] = await database_1.pool.query('SELECT * FROM enquiries WHERE id = ?', [id]);
        return rows[0] || null;
    },
    async updateEnquiryStatus(id, status) {
        const [result] = await database_1.pool.query('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },
    async deleteEnquiry(id) {
        const [result] = await database_1.pool.query('DELETE FROM enquiries WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};
