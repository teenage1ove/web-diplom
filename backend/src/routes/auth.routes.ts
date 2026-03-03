import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Public routes (with strict rate limiting)
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.get(
  '/verify-email/:token',
  validate(verifyEmailSchema),
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken
);

// Protected routes (require authentication)
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
