import { Router } from 'express';
import { paymentController } from './payment.controller';
import { optionalAuth, protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const admin = [protect, authorizeRoles('Admin', 'Super Admin')];

router.get('/config', paymentController.config);
router.post('/orders', optionalAuth, paymentController.createOrder);
router.post('/sbi/return', paymentController.sbiReturn);
router.get('/sbi/return', paymentController.sbiReturn);
router.post('/sbi/webhook', paymentController.sbiWebhook);
router.get('/status/:id', paymentController.status);
router.post('/:id/refund', ...admin, paymentController.refund);

export default router;
