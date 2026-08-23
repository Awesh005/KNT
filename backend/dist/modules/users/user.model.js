"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const database_1 = require("../../config/database");
exports.userModel = {
    async getAllUsers(limit, offset) {
        const [rows] = await database_1.pool.query('SELECT id, name, email, mobile, role, status, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const [totalRows] = await database_1.pool.query('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL');
        return {
            users: rows,
            total: totalRows[0].total
        };
    },
    async createAdmin(id, name, email, passwordHash) {
        const [result] = await database_1.pool.query('INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)', [id, name, email, passwordHash, 'Admin', 'active']);
        return result.affectedRows > 0;
    },
    async updateAdmin(id, email, passwordHash) {
        if (passwordHash) {
            const [result] = await database_1.pool.query('UPDATE users SET email = ?, password_hash = ? WHERE id = ? AND deleted_at IS NULL', [email, passwordHash, id]);
            return result.affectedRows > 0;
        }
        else {
            const [result] = await database_1.pool.query('UPDATE users SET email = ? WHERE id = ? AND deleted_at IS NULL', [email, id]);
            return result.affectedRows > 0;
        }
    },
    async getUserById(id) {
        const [rows] = await database_1.pool.query('SELECT id, name, email, mobile, role, status, created_at FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        return rows[0] || null;
    },
    async updateUserRole(id, role) {
        const [result] = await database_1.pool.query('UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL', [role, id]);
        return result.affectedRows > 0;
    },
    async updateUserStatus(id, status) {
        const [result] = await database_1.pool.query('UPDATE users SET status = ? WHERE id = ? AND deleted_at IS NULL', [status, id]);
        return result.affectedRows > 0;
    },
    async deleteUser(id) {
        const [result] = await database_1.pool.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    async getUserPasswordHash(id) {
        const [rows] = await database_1.pool.query('SELECT password_hash FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
        return rows[0]?.password_hash || null;
    },
    async updateProfile(id, name, hashedPassword) {
        if (hashedPassword) {
            const [result] = await database_1.pool.query('UPDATE users SET name = ?, password_hash = ? WHERE id = ? AND deleted_at IS NULL', [name, hashedPassword, id]);
            return result.affectedRows > 0;
        }
        else {
            const [result] = await database_1.pool.query('UPDATE users SET name = ? WHERE id = ? AND deleted_at IS NULL', [name, id]);
            return result.affectedRows > 0;
        }
    }
};
