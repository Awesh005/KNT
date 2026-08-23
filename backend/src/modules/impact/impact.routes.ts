import { Router } from 'express';
import { impactController } from './impact.controller';
import { protect, optionalAuth } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const admin = [protect, authorizeRoles('Admin', 'Super Admin')];

router.get('/sdg', impactController.sdg);
router.get('/overview', ...admin, impactController.overview);
router.get('/csr', ...admin, impactController.csr);
router.get('/beneficiaries', ...admin, impactController.beneficiaries);

router.get('/campaigns/:id', optionalAuth, impactController.getProject);
router.get('/campaigns/:id/updates', impactController.listUpdates);
router.post('/campaigns/:id/beneficiaries', ...admin, impactController.addBeneficiary);
router.delete('/campaigns/:id/beneficiaries/:beneficiaryId', ...admin, impactController.deleteBeneficiary);
router.post('/campaigns/:id/updates', ...admin, impactController.addUpdate);
router.delete('/campaigns/:id/updates/:updateId', ...admin, impactController.deleteUpdate);

export default router;
