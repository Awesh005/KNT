"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internApplicationModel = void 0;
const database_1 = require("../../config/database");
exports.internApplicationModel = {
    async create(data) {
        const [result] = await database_1.pool.query(`INSERT INTO intern_applications
        (internship_id, internship_title, name, email, phone, college, course, year, duration, message, resume_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`, [
            data.internship_id,
            data.internship_title,
            data.name,
            data.email,
            data.phone,
            data.college,
            data.course,
            data.year || null,
            data.duration || null,
            data.message || null,
            data.resume_url || null,
        ]);
        return result.insertId;
    },
    async list(status) {
        const params = [];
        let query = 'SELECT * FROM intern_applications WHERE 1=1';
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await database_1.pool.query(query, params);
        return rows;
    },
    async getById(id) {
        const [rows] = await database_1.pool.query('SELECT * FROM intern_applications WHERE id = ?', [id]);
        return rows[0] || null;
    },
    async updateStatus(id, status) {
        const [result] = await database_1.pool.query('UPDATE intern_applications SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },
    async remove(id) {
        const [result] = await database_1.pool.query('DELETE FROM intern_applications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
};
