import { Router } from 'express';
import { internApplicationController } from './intern-application.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { uploadJobApplicationFiles } from '../../middleware/upload.middleware';

const router = Router();

router.post('/', uploadJobApplicationFiles.single('resume'), internApplicationController.create);

router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.post('/admin', uploadJobApplicationFiles.single('resume'), internApplicationController.create);
router.get('/', internApplicationController.list);
router.patch('/:id/status', internApplicationController.updateStatus);
router.delete('/:id', internApplicationController.remove);

export default router;
