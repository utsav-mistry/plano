import mongoose from 'mongoose';
import Invoice from './invoice.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { INVOICE_STATUS } from '../../constants/statuses.js';
import { emailQueue } from '../../config/bullmq.js';

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `INV-${year}${month}-${rand}`;
};

export const create = async (data, createdBy) => {
  const invoiceNumber = generateInvoiceNumber();
  const invoice = await Invoice.create({ ...data, invoiceNumber, createdBy });

  // Queue email notification
  await emailQueue.add('invoice-created', {
    invoiceId: invoice._id.toString(),
    userId: invoice.userId.toString(),
    type: 'invoice_created',
  });

  return invoice;
};

export const getAll = async ({ page = 1, limit = 20, status, userId, subscriptionId }) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (subscriptionId) filter.subscriptionId = subscriptionId;
  const skip = (page - 1) * limit;
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('userId', 'name email')
      .populate('subscriptionId', 'planId status')
      .skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Invoice.countDocuments(filter),
  ]);
  return { invoices, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest('Invalid invoice id');
  }

  const invoice = await Invoice.findById(id)
    .populate('userId', 'name email')
    .populate('subscriptionId')
    .populate('paymentId');
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
};

export const markSent = async (id) => {
  const invoice = await Invoice.findByIdAndUpdate(
    id,
    { status: INVOICE_STATUS.SENT, sentAt: new Date() },
    { new: true }
  );
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
};

export const voidInvoice = async (id, reason) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === INVOICE_STATUS.PAID) {
    throw ApiError.badRequest('Cannot void a paid invoice. Use refund instead.');
  }
  invoice.status = INVOICE_STATUS.VOID;
  invoice.voidedAt = new Date();
  invoice.voidReason = reason;
  await invoice.save();
  return invoice;
};
