"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donation_controller_1 = require("./donation.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const donation_validation_1 = require("./donation.validation");
const router = (0, express_1.Router)();
router.get('/stats', donation_controller_1.donationController.getPublicStats);
// User routes
router.post('/', auth_middleware_1.optionalAuth, (0, validate_middleware_1.validate)(donation_validation_1.createDonationSchema), donation_controller_1.donationController.createDonation);
router.get('/my-donations', auth_middleware_1.protect, donation_controller_1.donationController.getMyDonations);
router.get('/:id', auth_middleware_1.protect, donation_controller_1.donationController.getDonationById);
// Admin / Super Admin routes
router.get('/', auth_middleware_1.protect, (0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'), donation_controller_1.donationController.getDonations);
router.patch('/:id/verify', auth_middleware_1.protect, (0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'), (0, validate_middleware_1.validate)(donation_validation_1.updateDonationStatusSchema), donation_controller_1.donationController.verifyDonation);
router.delete('/:id', auth_middleware_1.protect, (0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'), donation_controller_1.donationController.deleteDonation);
exports.default = router;
