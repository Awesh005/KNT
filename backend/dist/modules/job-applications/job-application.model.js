"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobApplicationModel = void 0;
const database_1 = require("../../config/database");
exports.jobApplicationModel = {
    async createApplication(data) {
        const [result] = await database_1.pool.query(`INSERT INTO job_applications (job_id, job_title, name, email, phone, qualification, experience, documents, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')`, [
            data.job_id,
            data.job_title,
            data.name,
            data.email,
            data.phone,
            data.qualification,
            data.experience || null,
            JSON.stringify(data.documents),
        ]);
        return result.insertId;
    },
    async getApplications(filters) {
        let query = 'SELECT * FROM job_applications WHERE 1=1';
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
        const applications = rows.map((row) => ({
            ...row,
            documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents,
        }));
        return {
            applications,
            total: totalRows[0].total,
        };
    },
    async getApplicationById(id) {
        const [rows] = await database_1.pool.query('SELECT * FROM job_applications WHERE id = ?', [id]);
        const row = rows[0];
        if (!row)
            return null;
        return {
            ...row,
            documents: typeof row.documents === 'string' ? JSON.parse(row.documents) : row.documents,
        };
    },
    async updateApplicationStatus(id, status) {
        const [result] = await database_1.pool.query('UPDATE job_applications SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },
    async deleteApplication(id) {
        const [result] = await database_1.pool.query('DELETE FROM job_applications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    async countByStatus(status) {
        const [rows] = await database_1.pool.query('SELECT COUNT(*) as total FROM job_applications WHERE status = ?', [status]);
        return rows[0].total;
    },
};
