import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), userController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), userController.getById);
router.put('/:id', authorize(ROLES.ADMIN), userController.update);
router.delete('/:id', authorize(ROLES.ADMIN), userController.deactivate);

export default router;
