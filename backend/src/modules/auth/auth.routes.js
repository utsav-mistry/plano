import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { ROLES } from '../../constants/roles.js';
import validate from '../../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  inviteCustomerSchema,
  forgotPasswordSchema,
  sendVerificationEmailSchema,
  verifyEmailSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from './auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/invite-customer', authenticate, authorize(ROLES.ADMIN), authLimiter, validate(inviteCustomerSchema), authController.inviteCustomer);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/send-verification-email', authLimiter, validate(sendVerificationEmailSchema), authController.sendVerificationEmail);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/send-otp', authLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
