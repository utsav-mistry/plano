import { Router } from 'express';
import * as paymentController from './payment.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { idempotency } from '../../middleware/idempotency.middleware.js';
import { paymentLimiter } from '../../middleware/rateLimiter.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Webhooks — no auth, raw body needed for signature verification
router.post('/webhook/:gateway', paymentController.webhook);

router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/:id', paymentController.getById);
router.post('/', paymentLimiter, idempotency, paymentController.create);
router.post('/:id/refund', authorize(ROLES.ADMIN), paymentController.refund);

export default router;
