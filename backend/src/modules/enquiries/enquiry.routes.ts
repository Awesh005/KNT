import { Router } from 'express';
import { enquiryController } from './enquiry.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createEnquirySchema, updateEnquiryStatusSchema } from './enquiry.validation';

const router = Router();

// Public route for anyone to submit contact form
router.post('/', validate(createEnquirySchema), enquiryController.createEnquiry);

// Protected routes (Admin / Super Admin only)
router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.get('/', enquiryController.getEnquiries);
router.get('/:id', enquiryController.getEnquiryById);
router.patch('/:id/status', validate(updateEnquiryStatusSchema), enquiryController.updateStatus);
router.delete('/:id', enquiryController.deleteEnquiry);

export default router;
