import { Router } from 'express';
import * as reportController from './report.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { reportLimiter, dashboardLimiter } from '../../middleware/rateLimiter.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

// FIX [C4]: Dashboard KPIs restricted to admin/internal_user — prevents leaking to portal_user
router.get('/dashboard-stats', dashboardLimiter, authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), reportController.dashboardStats);

// Admin-only — heavy aggregation queries, strict 10/hour limit
router.get('/revenue',       reportLimiter, authorize(ROLES.ADMIN), reportController.revenue);
router.get('/mrr',           reportLimiter, authorize(ROLES.ADMIN), reportController.mrr);
router.get('/churn',         reportLimiter, authorize(ROLES.ADMIN), reportController.churn);
router.get('/subscriptions', reportLimiter, authorize(ROLES.ADMIN), reportController.subscriptions);
router.get('/users',         reportLimiter, authorize(ROLES.ADMIN), reportController.userGrowth);

// Admin + Internal User
router.get('/invoices', reportLimiter, authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), reportController.invoices);

export default router;
