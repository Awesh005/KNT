import { Router } from 'express';
import { requestController } from './request.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRequestSchema, updateRequestStatusSchema } from './request.validation';
import { uploadRequestDocument } from '../../middleware/upload.middleware';

const router = Router();

router.use(protect);

// User routes
router.post('/upload', uploadRequestDocument.single('document'), requestController.uploadDocument);
router.post('/', validate(createRequestSchema), requestController.createRequest);
router.get('/my-requests', requestController.getMyRequests);
router.get('/:id', requestController.getRequestById);

// Admin routes
router.get('/', authorizeRoles('Admin', 'Super Admin'), requestController.getRequests);
router.patch('/:id/status', authorizeRoles('Admin', 'Super Admin'), validate(updateRequestStatusSchema), requestController.updateStatus);

export default router;
