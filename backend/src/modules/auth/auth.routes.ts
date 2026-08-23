import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { protect } from '../../middleware/auth.middleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);
router.post('/verify-email', authController.verifyEmail);
router.post('/2fa/verify', authController.verify2fa);
router.post('/2fa/setup', protect, authController.setup2fa);
router.post('/2fa/enable', protect, authController.enable2fa);
router.post('/2fa/disable', protect, authController.disable2fa);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

router.get('/me', protect, authController.getMe);

export default router;
