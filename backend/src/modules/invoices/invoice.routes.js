import { Router } from 'express';
import * as invoiceController from './invoice.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import { idempotency } from '../../middleware/idempotency.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', idempotency, authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), invoiceController.create);
router.get('/:id/download', invoiceController.downloadPdf);
router.post('/:id/confirm', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), invoiceController.confirm);
router.post('/:id/send', authorize(ROLES.ADMIN, ROLES.INTERNAL_USER), invoiceController.send);
router.post('/:id/cancel', authorize(ROLES.ADMIN), invoiceController.cancel);
router.post('/:id/void', authorize(ROLES.ADMIN), invoiceController.voidInvoice);

export default router;
