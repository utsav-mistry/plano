import { Router } from 'express';
import * as planController from './plan.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', planController.getAll);
router.get('/:id', planController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), planController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), planController.update);
router.delete('/:id', authorize(ROLES.ADMIN), planController.remove);

export default router;
