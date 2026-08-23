import { Router } from 'express';
import { donorController } from './donor.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { donorNoteSchema, donorTagsSchema, donorStatementSchema } from './donor.validation';

const router = Router();

router.use(protect);
router.use(authorizeRoles('Admin', 'Super Admin'));

router.get('/', donorController.listDonors);
router.get('/export.csv', donorController.exportCsv);
router.post('/statements/bulk', validate(donorStatementSchema), donorController.emailAllStatements);
router.get('/:key', donorController.getDonor);
router.post('/:key/notes', validate(donorNoteSchema), donorController.addNote);
router.put('/:key/tags', validate(donorTagsSchema), donorController.setTags);
router.post('/:key/statements', validate(donorStatementSchema), donorController.generateStatement);

export default router;
