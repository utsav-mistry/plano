import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(ROLES.ADMIN), userController.getAll);
router.get('/:id', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), userController.getById);

// Update user — Admin can update anyone, Users can update themselves
const updateHandler = (req, res, next) => {
  if (req.user.role === ROLES.ADMIN || req.user._id.toString() === req.params.id) {
    return next();
  }
  next(ApiError.forbidden('You can only update your own profile'));
};

router.put('/:id', updateHandler, userController.update);
router.patch('/:id', updateHandler, userController.update);

router.post('/:id/toggle-status', authorize(ROLES.ADMIN), userController.toggleStatus);
router.delete('/:id', authorize(ROLES.ADMIN), userController.remove);

export default router;
