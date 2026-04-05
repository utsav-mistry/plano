import Quotation from './quotation.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { QUOTATION_STATUS } from '../../constants/statuses.js';

const generateQuotationNumber = () => {
  const date = new Date();
  return `QUO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;
};

export const create = async (data, createdBy) => {
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length === 0) {
    throw ApiError.badRequest('At least one quotation item is required');
  }

  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const discountValue = Number(item.discountValue || 0);
    const taxValue = Number(item.taxValue || 0);
    const computedTotal = Math.max(quantity * unitPrice - discountValue + taxValue, 0);

    return {
      ...item,
      quantity,
      unitPrice,
      discountValue,
      taxValue,
      total: Number(item.total ?? computedTotal),
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const itemDiscountTotal = normalizedItems.reduce((sum, item) => sum + (item.discountValue || 0), 0);
  const itemTaxTotal = normalizedItems.reduce((sum, item) => sum + (item.taxValue || 0), 0);

  const discountTotal = Number.isFinite(Number(data.discountTotal))
    ? Number(data.discountTotal)
    : itemDiscountTotal;
  const taxTotal = Number.isFinite(Number(data.taxTotal))
    ? Number(data.taxTotal)
    : itemTaxTotal;
  const grandTotal = subtotal - discountTotal + taxTotal;

  const validUntil = data.validUntil ? new Date(data.validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

  return Quotation.create({
    ...data,
    items: normalizedItems,
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    validUntil,
    quotationNumber: generateQuotationNumber(),
    createdBy,
  });
};

export const getAll = async ({ page = 1, limit = 20, status, userId }) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  const skip = (page - 1) * limit;
  const [quotations, total] = await Promise.all([
    Quotation.find(filter).populate('userId', 'name email').skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Quotation.countDocuments(filter),
  ]);
  return { quotations, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const q = await Quotation.findById(id).populate('userId subscriptionId');
  if (!q) throw ApiError.notFound('Quotation not found');
  return q;
};

export const update = async (id, data) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');
  if (q.status === QUOTATION_STATUS.ACCEPTED || q.status === QUOTATION_STATUS.REJECTED) {
    throw ApiError.badRequest('Cannot edit a finalized quotation');
  }
  return Quotation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const send = async (id) => {
  const q = await Quotation.findByIdAndUpdate(id, { status: QUOTATION_STATUS.SENT, sentAt: new Date() }, { new: true });
  if (!q) throw ApiError.notFound('Quotation not found');
  return q;
};

export const convert = async (id, createdBy) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');
  if (q.convertedToSubscription) throw ApiError.conflict('Already converted to a subscription');
  if (q.status !== QUOTATION_STATUS.ACCEPTED) throw ApiError.badRequest('Only accepted quotations can be converted');
  // TODO: Create subscription from quotation items
  q.convertedToSubscription = true;
  q.status = QUOTATION_STATUS.ACCEPTED;
  await q.save();
  return q;
};
