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
router.patch('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), subscriptionController.update);
router.post('/:id/confirm', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.confirm);
router.post('/:id/activate', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.activate);
// FIX [C1]: All roles can cancel, but controller enforces portal_user ownership
router.post('/:id/cancel', subscriptionController.cancel);
router.post('/:id/pause', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.pause);
router.post('/:id/resume', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), subscriptionController.resume);

export default router;
