import { Router } from 'express';
import { commsController } from './comms.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
router.use(protect, authorizeRoles('Admin', 'Super Admin'));
router.get('/templates', commsController.templates);
router.put('/templates/:key', commsController.updateTemplate);
router.get('/log', commsController.log);

export default router;
