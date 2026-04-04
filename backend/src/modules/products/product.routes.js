import { Router } from 'express';
import * as productController from './product.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), productController.create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), productController.update);
router.delete('/:id', authorize(ROLES.ADMIN), productController.remove);

export default router;
