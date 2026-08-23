"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("./campaign.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const campaign_validation_1 = require("./campaign.validation");
const router = (0, express_1.Router)();
// Public routes
router.get('/', campaign_controller_1.campaignController.getCampaigns);
router.get('/:id', campaign_controller_1.campaignController.getCampaignById);
router.get('/:id/donations', campaign_controller_1.campaignController.getCampaignDonations);
router.get('/:id/payouts', campaign_controller_1.campaignController.getCampaignPayouts);
// Protected routes (Admin / Super Admin only)
router.use(auth_middleware_1.protect);
router.use((0, role_middleware_1.authorizeRoles)('Admin', 'Super Admin'));
router.post('/', (0, validate_middleware_1.validate)(campaign_validation_1.createCampaignSchema), campaign_controller_1.campaignController.createCampaign);
router.patch('/:id', (0, validate_middleware_1.validate)(campaign_validation_1.updateCampaignSchema), campaign_controller_1.campaignController.updateCampaign);
router.delete('/:id', campaign_controller_1.campaignController.deleteCampaign);
// Payouts management (Admin)
router.post('/:id/payouts', campaign_controller_1.campaignController.addCampaignPayout);
router.delete('/:id/payouts/:payoutId', campaign_controller_1.campaignController.removeCampaignPayout);
exports.default = router;
