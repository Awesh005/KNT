import { Router } from 'express';
import { campaignController } from './campaign.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createCampaignSchema, updateCampaignSchema } from './campaign.validation';

const router = Router();

// Public routes
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.get('/:id/donations', campaignController.getCampaignDonations);
router.get('/:id/payouts', campaignController.getCampaignPayouts);

// Protected routes (Admin / Super Admin only)
router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.post('/', validate(createCampaignSchema), campaignController.createCampaign);
router.patch('/:id', validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Payouts management (Admin)
router.post('/:id/payouts', campaignController.addCampaignPayout);
router.delete('/:id/payouts/:payoutId', campaignController.removeCampaignPayout);

export default router;
