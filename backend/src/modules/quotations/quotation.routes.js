import { Router } from 'express';
import * as quotationController from './quotation.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { idempotency } from '../../middleware/idempotency.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', quotationController.getAll);
router.get('/:id', quotationController.getById);
router.post('/', idempotency, authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), quotationController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), quotationController.update);
router.post('/:id/send', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), quotationController.send);
router.post('/:id/convert', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), quotationController.convert);
router.post('/:id/review', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), quotationController.review);
router.post('/:id/respond', authorize(ROLES.PORTAL_USER), quotationController.respond);
router.post('/:id/close', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), quotationController.close);
router.post('/:id/upsell', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), quotationController.upsell);

export default router;
