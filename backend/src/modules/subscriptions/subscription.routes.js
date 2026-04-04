import { Router } from 'express';
import * as subscriptionController from './subscription.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { idempotency } from '../../middleware/idempotency.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', subscriptionController.getAll);
router.get('/:id', subscriptionController.getById);
router.post('/', idempotency, authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), subscriptionController.create);
router.post('/:id/cancel', subscriptionController.cancel);
router.post('/:id/pause', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.pause);
router.post('/:id/resume', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.resume);

export default router;
