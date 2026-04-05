import { Router } from 'express';
import * as taxController from './tax.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), taxController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER, ROLES.PORTAL_USER), taxController.getById);
router.post('/', authorize(ROLES.ADMIN), taxController.create);
router.put('/:id', authorize(ROLES.ADMIN), taxController.update);
router.delete('/:id', authorize(ROLES.ADMIN), taxController.remove);

export default router;
