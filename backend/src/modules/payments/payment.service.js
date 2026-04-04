import Payment from './payment.model.js';
import Invoice from '../invoices/invoice.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { PAYMENT_STATUS, INVOICE_STATUS } from '../../constants/statuses.js';
import { emailQueue } from '../../config/bullmq.js';

export const create = async (data) => {
  const invoice = await Invoice.findById(data.invoiceId);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === INVOICE_STATUS.PAID) {
    throw ApiError.conflict('Invoice is already paid');
  }
  if (invoice.status === INVOICE_STATUS.VOID) {
    throw ApiError.badRequest('Cannot pay a void invoice');
  }

  const payment = await Payment.create({
    ...data,
    status: PAYMENT_STATUS.PENDING,
    processedAt: new Date(),
  });

  // Mark invoice as paid
  invoice.status = INVOICE_STATUS.PAID;
  invoice.paidAt = new Date();
  invoice.paymentId = payment._id;
  await invoice.save();

  // Update payment to success
  payment.status = PAYMENT_STATUS.SUCCESS;
  await payment.save();

  // Queue payment confirmation email
  await emailQueue.add('payment-success', {
    paymentId: payment._id.toString(),
    userId: payment.userId.toString(),
    amount: payment.amount,
    currency: payment.currency,
  });

  return payment;
};

export const getAll = async ({ page = 1, limit = 20, status, userId, gateway }) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (gateway) filter.gateway = gateway;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('userId', 'name email')
      .populate('invoiceId', 'invoiceNumber grandTotal')
      .skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);
  return { payments, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const payment = await Payment.findById(id).populate('userId invoiceId subscriptionId');
  if (!payment) throw ApiError.notFound('Payment not found');
  return payment;
};

export const refund = async (id, { amount, reason }) => {
  const payment = await Payment.findById(id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status !== PAYMENT_STATUS.SUCCESS) {
    throw ApiError.badRequest('Only successful payments can be refunded');
  }
  const refundAmount = amount || payment.amount;
  if (refundAmount > payment.amount) {
    throw ApiError.badRequest('Refund amount cannot exceed payment amount');
  }

  payment.refundAmount = refundAmount;
  payment.refundReason = reason;
  payment.refundedAt = new Date();
  payment.status = refundAmount < payment.amount
    ? PAYMENT_STATUS.PARTIALLY_REFUNDED
    : PAYMENT_STATUS.REFUNDED;
  await payment.save();

  // Update linked invoice status
  await Invoice.findByIdAndUpdate(payment.invoiceId, {
    status: INVOICE_STATUS.REFUNDED,
  });

  return payment;
};

export const handleWebhook = async (gateway, payload) => {
  // Stub: gateway-specific webhook handling
  // TODO: Verify webhook signature per gateway
  // Stripe: stripe.webhooks.constructEvent(...)
  // Razorpay: crypto HMAC validation
  return { received: true, gateway };
};
