import { Router } from 'express';
import { officeController } from './office.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { uploadOfficeFile, uploadOfficeSeal } from '../../middleware/upload.middleware';

const router = Router();
const admin = [protect, authorizeRoles('Admin', 'Super Admin')];

router.get('/verify/:code', officeController.verify);

router.get('/files', protect, officeController.listFiles);
router.post('/files', ...admin, uploadOfficeFile.single('file'), officeController.uploadFile);
router.patch('/files/:id', ...admin, officeController.updateFile);
router.delete('/files/:id', ...admin, officeController.deleteFile);

router.get('/templates', ...admin, officeController.listTemplates);
router.post('/templates', ...admin, officeController.createTemplate);
router.get('/letters', ...admin, officeController.listLetters);
router.post('/letters', ...admin, officeController.dispatchLetter);
router.post('/letters/:id/send', ...admin, officeController.sendLetter);
router.get('/sends', ...admin, officeController.listSends);
router.get('/seal', ...admin, officeController.getSeal);
router.post('/seal', ...admin, uploadOfficeSeal.single('seal'), officeController.uploadSeal);

export default router;
