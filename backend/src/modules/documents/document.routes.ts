import { Router } from 'express';
import { documentController } from './document.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

// Document generation requires Admin / Super Admin
router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.post('/receipts/:donationId', documentController.generateReceipt);
router.post('/certificates/:donationId', documentController.generate80GCertificate);

export default router;
