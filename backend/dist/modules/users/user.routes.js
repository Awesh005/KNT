"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
// Protect all user routes (require login)
router.use(auth_middleware_1.protect);
// Allow any logged-in user to update their own profile
router.put('/profile', user_controller_1.userController.updateProfile);
// Super Admin only routes
router.get('/', (0, role_middleware_1.authorizeRoles)('Super Admin'), user_controller_1.userController.getAllUsers);
router.get('/:id', (0, role_middleware_1.authorizeRoles)('Super Admin'), user_controller_1.userController.getUserById);
router.patch('/:id/status', (0, role_middleware_1.authorizeRoles)('Super Admin'), (0, validate_middleware_1.validate)(user_validation_1.updateStatusSchema), user_controller_1.userController.updateStatus);
router.patch('/:id/role', (0, role_middleware_1.authorizeRoles)('Super Admin'), (0, validate_middleware_1.validate)(user_validation_1.updateRoleSchema), user_controller_1.userController.updateRole);
router.delete('/:id', (0, role_middleware_1.authorizeRoles)('Super Admin'), user_controller_1.userController.deleteUser);
router.post('/admin', (0, role_middleware_1.authorizeRoles)('Super Admin'), (0, validate_middleware_1.validate)(user_validation_1.createAdminSchema), user_controller_1.userController.createAdmin);
router.patch('/admin/:id', (0, role_middleware_1.authorizeRoles)('Super Admin'), (0, validate_middleware_1.validate)(user_validation_1.updateAdminSchema), user_controller_1.userController.updateAdmin);
exports.default = router;
