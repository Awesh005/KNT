import { Router } from 'express';
import { userController } from './user.controller';
import { protect } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateRoleSchema, updateStatusSchema, createAdminSchema, updateAdminSchema } from './user.validation';

const router = Router();

// Protect all user routes (require login)
router.use(protect);

// Allow any logged-in user to update their own profile
router.put('/profile', userController.updateProfile);

// Super Admin only routes
router.get('/', authorizeRoles('Super Admin'), userController.getAllUsers);
router.get('/:id', authorizeRoles('Super Admin'), userController.getUserById);
router.patch('/:id/status', authorizeRoles('Super Admin'), validate(updateStatusSchema), userController.updateStatus);
router.patch('/:id/role', authorizeRoles('Super Admin'), validate(updateRoleSchema), userController.updateRole);
router.delete('/:id', authorizeRoles('Super Admin'), userController.deleteUser);
router.post('/admin', authorizeRoles('Super Admin'), validate(createAdminSchema), userController.createAdmin);
router.patch('/admin/:id', authorizeRoles('Super Admin'), validate(updateAdminSchema), userController.updateAdmin);

export default router;
