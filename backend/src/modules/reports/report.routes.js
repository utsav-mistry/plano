import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { reportLimiter } from '../../middleware/rateLimiter.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate, reportLimiter);

// Admin-only
router.get('/revenue',       authorize(ROLES.ADMIN), reportController.revenue);
router.get('/mrr',           authorize(ROLES.ADMIN), reportController.mrr);
router.get('/churn',         authorize(ROLES.ADMIN), reportController.churn);
router.get('/subscriptions', authorize(ROLES.ADMIN), reportController.subscriptions);
router.get('/users',         authorize(ROLES.ADMIN), reportController.userGrowth);

// Admin + Internal User
router.get('/invoices', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), reportController.invoices);

export default router;
