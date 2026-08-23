"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("./document.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
// Document generation requires Admin / Super Admin
router.use(auth_middleware_1.protect);
router.use((0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'));
router.post('/receipts/:donationId', document_controller_1.documentController.generateReceipt);
router.post('/certificates/:donationId', document_controller_1.documentController.generate80GCertificate);
exports.default = router;
