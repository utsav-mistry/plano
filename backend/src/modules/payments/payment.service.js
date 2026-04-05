import Payment from './payment.model.js';
import Invoice from '../invoices/invoice.model.js';
import Subscription from '../subscriptions/subscription.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { PAYMENT_STATUS, INVOICE_STATUS } from '../../constants/statuses.js';
import { emailQueue } from '../../config/bullmq.js';
import { PAYMENT_GATEWAY, PAYMENT_METHOD } from '../../constants/statuses.js';
import crypto from 'crypto';

const generateInvoiceNumber = () => {
  const date = new Date();
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;
};

const safeCompare = (a, b) => {
  const aBuf = Buffer.from(String(a || ''), 'utf8');
  const bBuf = Buffer.from(String(b || ''), 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const verifyRazorpayCheckoutSignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw ApiError.internal('Razorpay key secret is not configured');
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return safeCompare(expected, signature);
};

const verifyRazorpayWebhookSignature = ({ rawBody, signature }) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw ApiError.internal('Razorpay webhook secret is not configured');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return safeCompare(expected, signature);
};

const buildInvoiceFromSubscription = async (subscription, createdBy) => {
  const existingInvoice = await Invoice.findOne({
    subscriptionId: subscription._id,
    status: { $ne: INVOICE_STATUS.VOID },
  }).sort({ createdAt: -1 });

  if (existingInvoice) return existingInvoice;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  return Invoice.create({
    invoiceNumber: generateInvoiceNumber(),
    subscriptionId: subscription._id,
    userId: subscription.userId,
    items: [
      {
        description: `${subscription.planId?.name || 'Subscription'} checkout`,
        quantity: subscription.quantity,
        unitPrice: subscription.unitPrice,
        discountValue: subscription.discountApplied,
        taxValue: subscription.taxApplied,
        total: subscription.grandTotal,
      },
    ],
    subtotal: subscription.totalPrice,
    discountTotal: subscription.discountApplied,
    taxTotal: subscription.taxApplied,
    grandTotal: subscription.grandTotal,
    currency: subscription.currency,
    status: INVOICE_STATUS.SENT,
    dueDate,
    billingPeriodStart: subscription.startDate,
    billingPeriodEnd: subscription.endDate,
    createdBy,
  });
};

export const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw ApiError.internal('Razorpay credentials are not configured');
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw ApiError.badRequest('Order amount must be a positive number');
  }

  const orderAmount = Math.round(numericAmount * 100);
  const safeCurrency = String(currency || 'INR').toUpperCase();
  const safeReceipt = receipt || `plano-${Date.now()}`;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: orderAmount,
      currency: safeCurrency,
      receipt: safeReceipt,
      notes,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw ApiError.badRequest(payload?.error?.description || 'Unable to create Razorpay order');
  }

  return {
    id: payload.id,
    amount: payload.amount,
    currency: payload.currency,
    status: payload.status,
    receipt: payload.receipt,
  };
};

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
  if (gateway !== PAYMENT_GATEWAY.RAZORPAY) {
    return { received: true, gateway, processed: false, reason: 'Unsupported gateway webhook' };
  }

  const { body, signature, rawBody } = payload || {};
  if (!signature || !rawBody) {
    throw ApiError.badRequest('Missing webhook signature or raw body');
  }

  if (!verifyRazorpayWebhookSignature({ rawBody, signature })) {
    throw ApiError.badRequest('Invalid Razorpay webhook signature');
  }

  const event = body?.event;
  if (event !== 'payment.captured') {
    return { received: true, gateway, verified: true, processed: false, event };
  }

  const paymentEntity = body?.payload?.payment?.entity;
  const transactionId = paymentEntity?.id;
  if (!transactionId) {
    throw ApiError.badRequest('Missing Razorpay payment id in webhook payload');
  }

  const duplicate = await Payment.findOne({
    gateway: PAYMENT_GATEWAY.RAZORPAY,
    gatewayTransactionId: transactionId,
  });
  if (duplicate) {
    return { received: true, gateway, verified: true, processed: false, duplicate: true };
  }

  const invoiceId = paymentEntity?.notes?.invoiceId;
  const subscriptionId = paymentEntity?.notes?.subscriptionId;

  let invoice = null;
  if (invoiceId) {
    invoice = await Invoice.findById(invoiceId);
  }

  if (!invoice && subscriptionId) {
    const subscription = await Subscription.findById(subscriptionId).populate('planId');
    if (subscription) {
      invoice = await buildInvoiceFromSubscription(subscription, subscription.userId);
    }
  }

  if (!invoice) {
    return { received: true, gateway, verified: true, processed: false, reason: 'No invoice mapping in webhook payload notes' };
  }

  if (invoice.status === INVOICE_STATUS.PAID) {
    return { received: true, gateway, verified: true, processed: false, reason: 'Invoice already paid' };
  }

  const amount = Number(paymentEntity?.amount || 0) / 100;
  const currency = String(paymentEntity?.currency || invoice.currency || 'INR').toUpperCase();

  const payment = await Payment.create({
    invoiceId: invoice._id,
    userId: invoice.userId,
    subscriptionId: invoice.subscriptionId,
    amount: amount > 0 ? amount : invoice.grandTotal,
    currency,
    method: PAYMENT_METHOD.UPI,
    gateway: PAYMENT_GATEWAY.RAZORPAY,
    gatewayTransactionId: transactionId,
    gatewayResponse: paymentEntity,
    status: PAYMENT_STATUS.SUCCESS,
    processedAt: new Date(),
  });

  invoice.status = INVOICE_STATUS.PAID;
  invoice.paidAt = new Date();
  invoice.paymentId = payment._id;
  await invoice.save();

  return {
    received: true,
    gateway,
    verified: true,
    processed: true,
    paymentId: payment._id.toString(),
    invoiceId: invoice._id.toString(),
  };
};

export const verifyRazorpayCheckoutAndRecord = async (data) => {
  const {
    userId,
    subscriptionId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    method,
    gatewayResponse,
  } = data || {};

  if (!userId || !subscriptionId || !orderId || !paymentId || !signature) {
    throw ApiError.badRequest('Missing required checkout verification fields');
  }

  const isValid = verifyRazorpayCheckoutSignature({ orderId, paymentId, signature });
  if (!isValid) {
    throw ApiError.badRequest('Invalid Razorpay checkout signature');
  }

  const subscription = await Subscription.findById(subscriptionId).populate('planId');
  if (!subscription) throw ApiError.notFound('Subscription not found');
  if (String(subscription.userId) !== String(userId)) {
    throw ApiError.forbidden('You can only record payments for your own subscriptions');
  }

  const duplicate = await Payment.findOne({
    gateway: PAYMENT_GATEWAY.RAZORPAY,
    gatewayTransactionId: paymentId,
    subscriptionId,
  });
  if (duplicate) {
    return { payment: duplicate, duplicate: true };
  }

  const invoice = await buildInvoiceFromSubscription(subscription, userId);
  if (invoice.status === INVOICE_STATUS.PAID) {
    throw ApiError.conflict('Invoice is already paid');
  }

  const payment = await Payment.create({
    invoiceId: invoice._id,
    userId: subscription.userId,
    subscriptionId: subscription._id,
    amount: invoice.grandTotal,
    currency: invoice.currency,
    method: method || PAYMENT_METHOD.UPI,
    gateway: PAYMENT_GATEWAY.RAZORPAY,
    gatewayTransactionId: paymentId,
    gatewayResponse: gatewayResponse || {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    },
    status: PAYMENT_STATUS.SUCCESS,
    processedAt: new Date(),
  });

  invoice.status = INVOICE_STATUS.PAID;
  invoice.paidAt = new Date();
  invoice.paymentId = payment._id;
  await invoice.save();

  await emailQueue.add('payment-success', {
    paymentId: payment._id.toString(),
    userId: payment.userId.toString(),
    amount: payment.amount,
    currency: payment.currency,
  });

  return { payment, invoice, subscription, duplicate: false };
};

export const getCheckoutAudit = async ({ limit = 25, userId } = {}) => {
  const parsedLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const subscriptionFilter = userId ? { userId } : {};

  const subscriptions = await Subscription.find(subscriptionFilter)
    .populate('userId', 'name email')
    .populate('planId', 'name billingCycle')
    .sort({ createdAt: -1 })
    .limit(parsedLimit)
    .lean();

  if (subscriptions.length === 0) return { events: [] };

  const subscriptionIds = subscriptions.map((sub) => sub._id);
  const [invoices, payments] = await Promise.all([
    Invoice.find({ subscriptionId: { $in: subscriptionIds } }).sort({ createdAt: -1 }).lean(),
    Payment.find({ subscriptionId: { $in: subscriptionIds } }).sort({ createdAt: -1 }).lean(),
  ]);

  const latestInvoiceBySub = new Map();
  for (const invoice of invoices) {
    const key = String(invoice.subscriptionId);
    if (!latestInvoiceBySub.has(key)) latestInvoiceBySub.set(key, invoice);
  }

  const latestPaymentBySub = new Map();
  for (const payment of payments) {
    const key = String(payment.subscriptionId);
    if (!latestPaymentBySub.has(key)) latestPaymentBySub.set(key, payment);
  }

  const events = subscriptions.map((sub) => {
    const sid = String(sub._id);
    const invoice = latestInvoiceBySub.get(sid);
    const payment = latestPaymentBySub.get(sid);

    return {
      subscriptionId: sid,
      subscriptionCreatedAt: sub.createdAt,
      customerName: sub.userId?.name || 'Customer',
      customerEmail: sub.userId?.email || '',
      planName: sub.planId?.name || 'Plan',
      amount: sub.grandTotal,
      currency: sub.currency,
      invoiceId: invoice?._id ? String(invoice._id) : null,
      invoiceNumber: invoice?.invoiceNumber || null,
      invoiceStatus: invoice?.status || null,
      invoiceCreatedAt: invoice?.createdAt || null,
      paymentId: payment?._id ? String(payment._id) : null,
      paymentStatus: payment?.status || null,
      paymentGateway: payment?.gateway || null,
      paymentReference: payment?.gatewayTransactionId || null,
      paymentCreatedAt: payment?.createdAt || null,
      dbChainComplete: Boolean(invoice?._id && payment?._id && invoice?.status === INVOICE_STATUS.PAID && payment?.status === PAYMENT_STATUS.SUCCESS),
    };
  });

  return { events };
};
