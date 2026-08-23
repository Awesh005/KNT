import { Router } from 'express';
import { jobApplicationController } from './job-application.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateJobApplicationStatusSchema, jobApplicationIdSchema } from './job-application.validation';
import { uploadJobApplicationFiles } from '../../middleware/upload.middleware';

const router = Router();

const applicationUpload = uploadJobApplicationFiles.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'pan', maxCount: 1 },
  { name: 'education', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'experienceDoc', maxCount: 1 },
  { name: 'caste', maxCount: 1 },
  { name: 'address', maxCount: 1 },
]);

router.post('/', applicationUpload, jobApplicationController.createApplication);

router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.post('/admin', applicationUpload, jobApplicationController.createAdminApplication);
router.get('/', jobApplicationController.getApplications);
router.get('/:id', validate(jobApplicationIdSchema), jobApplicationController.getApplicationById);
router.patch('/:id/status', validate(updateJobApplicationStatusSchema), jobApplicationController.updateStatus);
router.delete('/:id', validate(jobApplicationIdSchema), jobApplicationController.deleteApplication);

export default router;
