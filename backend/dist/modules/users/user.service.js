"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_model_1 = require("./user.model");
const errors_1 = require("../../utils/errors");
const crypto_1 = require("crypto");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.userService = {
    async getAllUsers(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const { users, total } = await user_model_1.userModel.getAllUsers(limit, offset);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    async createAdmin(data) {
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        const userId = 'USR-' + (0, crypto_1.randomUUID)().split('-')[0].toUpperCase();
        try {
            await user_model_1.userModel.createAdmin(userId, data.name, data.email, hashedPassword);
        }
        catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                throw new errors_1.ValidationError('Email already exists');
            }
            throw e;
        }
        return {
            id: userId,
            name: data.name,
            email: data.email,
            role: 'Admin'
        };
    },
    async updateAdmin(id, data) {
        let hashedPassword;
        if (data.password && data.password.trim() !== '') {
            hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        }
        try {
            const success = await user_model_1.userModel.updateAdmin(id, data.email, hashedPassword);
            if (!success) {
                throw new errors_1.NotFoundError('Admin not found');
            }
        }
        catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                throw new errors_1.ValidationError('Email already exists');
            }
            throw e;
        }
        return { message: 'Admin updated successfully' };
    },
    async getUserById(id) {
        const user = await user_model_1.userModel.getUserById(id);
        if (!user)
            throw new errors_1.NotFoundError('User not found');
        return user;
    },
    async updateUserRole(id, role) {
        const success = await user_model_1.userModel.updateUserRole(id, role);
        if (!success)
            throw new errors_1.NotFoundError('User not found');
        return { message: 'Role updated successfully' };
    },
    async updateUserStatus(id, status) {
        const success = await user_model_1.userModel.updateUserStatus(id, status);
        if (!success)
            throw new errors_1.NotFoundError('User not found');
        return { message: 'Status updated successfully' };
    },
    async deleteUser(id) {
        if (id === 'USR-001') {
            throw new errors_1.AppError('Cannot delete the primary Super Admin', 403);
        }
        const success = await user_model_1.userModel.deleteUser(id);
        if (!success)
            throw new errors_1.NotFoundError('User not found');
        return { message: 'User deleted successfully' };
    }
};
