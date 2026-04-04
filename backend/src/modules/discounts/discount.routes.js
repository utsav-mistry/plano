import { Router } from 'express';
import * as discountController from './discount.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', discountController.getAll);
router.get('/:id', discountController.getById);
router.post('/validate', discountController.validateCode);
router.post('/', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), discountController.create);
router.put('/:id', authorize(ROLES.ADMIN), discountController.update);
router.delete('/:id', authorize(ROLES.ADMIN), discountController.remove);

export default router;
