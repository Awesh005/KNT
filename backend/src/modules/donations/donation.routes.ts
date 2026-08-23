import { Router } from 'express';
import { donationController } from './donation.controller';
import { protect, optionalAuth } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createDonationSchema, updateDonationStatusSchema } from './donation.validation';

const router = Router();

router.get('/stats', donationController.getPublicStats);

// User routes
router.post('/', optionalAuth, validate(createDonationSchema), donationController.createDonation);
router.get('/my-donations', protect, donationController.getMyDonations);
router.get('/:id', protect, donationController.getDonationById);

// Admin / Super Admin routes
router.get('/', protect, authorizeRoles('Admin', 'Super Admin'), donationController.getDonations);
router.patch('/:id/verify', protect, authorizeRoles('Admin', 'Super Admin'), validate(updateDonationStatusSchema), donationController.verifyDonation);
router.delete('/:id', protect, authorizeRoles('Admin', 'Super Admin'), donationController.deleteDonation);

export default router;
