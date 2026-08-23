"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enquiry_controller_1 = require("./enquiry.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const enquiry_validation_1 = require("./enquiry.validation");
const router = (0, express_1.Router)();
// Public route for anyone to submit contact form
router.post('/', (0, validate_middleware_1.validate)(enquiry_validation_1.createEnquirySchema), enquiry_controller_1.enquiryController.createEnquiry);
// Protected routes (Admin / Super Admin only)
router.use(auth_middleware_1.protect);
router.use((0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'));
router.get('/', enquiry_controller_1.enquiryController.getEnquiries);
router.get('/:id', enquiry_controller_1.enquiryController.getEnquiryById);
router.patch('/:id/status', (0, validate_middleware_1.validate)(enquiry_validation_1.updateEnquiryStatusSchema), enquiry_controller_1.enquiryController.updateStatus);
router.delete('/:id', enquiry_controller_1.enquiryController.deleteEnquiry);
exports.default = router;
