import { Router } from 'express';
import { adminController } from './admin.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();

router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.get('/notifications', adminController.getNotifications);

export default router;
