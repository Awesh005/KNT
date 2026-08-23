"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_service_1 = require("./user.service");
const user_model_1 = require("./user.model");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
exports.userController = {
    async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const data = await user_service_1.userService.getAllUsers(page, limit);
            (0, response_1.sendSuccess)(res, 200, data, 'Users fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async createAdmin(req, res, next) {
        try {
            const result = await user_service_1.userService.createAdmin(req.body);
            (0, response_1.sendSuccess)(res, 201, result, 'Admin created successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateAdmin(req, res, next) {
        try {
            const result = await user_service_1.userService.updateAdmin(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, 200, result, 'Admin updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async getUserById(req, res, next) {
        try {
            const user = await user_service_1.userService.getUserById(req.params.id);
            (0, response_1.sendSuccess)(res, 200, { user }, 'User fetched successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateRole(req, res, next) {
        try {
            const result = await user_service_1.userService.updateUserRole(req.params.id, req.body.role);
            (0, response_1.sendSuccess)(res, 200, result, 'Role updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateStatus(req, res, next) {
        try {
            const result = await user_service_1.userService.updateUserStatus(req.params.id, req.body.status);
            (0, response_1.sendSuccess)(res, 200, result, 'Status updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, currentPassword, newPassword } = req.body;
            if (!name) {
                throw new errors_1.ValidationError('Name is required');
            }
            let hashedPassword;
            if (newPassword) {
                if (!currentPassword) {
                    throw new errors_1.ValidationError('Current password is required to set a new password');
                }
                const currentHash = await user_model_1.userModel.getUserPasswordHash(userId);
                if (!currentHash) {
                    throw new errors_1.AppError('User not found', 404);
                }
                const isMatch = await bcrypt_1.default.compare(currentPassword, currentHash);
                if (!isMatch) {
                    throw new errors_1.ValidationError('Incorrect current password');
                }
                hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            }
            const success = await user_model_1.userModel.updateProfile(userId, name, hashedPassword);
            if (!success) {
                throw new errors_1.AppError('Failed to update profile', 500);
            }
            (0, response_1.sendSuccess)(res, 200, null, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    },
    async deleteUser(req, res, next) {
        try {
            const result = await user_service_1.userService.deleteUser(req.params.id);
            (0, response_1.sendSuccess)(res, 200, result, 'User deleted successfully');
        }
        catch (error) {
            next(error);
        }
    }
};
