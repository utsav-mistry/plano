import Discount from './discount.model.js';
import { ApiError } from '../../utils/ApiError.js';

const DEFAULT_VALIDITY_DAYS = 30;

const mapAppliesToApplicableTo = (value) => {
  switch (value) {
    case 'subscriptions':
    case 'both':
    case 'all':
      return 'all';
    case 'plans':
      return 'plan';
    case 'products':
    case 'invoices':
      return 'product';
    default:
      return value;
  }
};

const normalizeDiscountPayload = (data = {}, { forCreate = false } = {}) => {
  const payload = { ...data };

  if (payload.validUntil == null && payload.validTo) {
    payload.validUntil = payload.validTo;
  }
  if (payload.maxUsage == null && payload.usageLimit !== undefined && payload.usageLimit !== '') {
    payload.maxUsage = Number(payload.usageLimit);
  }
  if (payload.applicableTo == null && payload.appliesTo) {
    payload.applicableTo = mapAppliesToApplicableTo(payload.appliesTo);
  }
  if (payload.minOrderAmount == null && payload.minPurchaseAmount !== undefined && payload.minPurchaseAmount !== '') {
    payload.minOrderAmount = Number(payload.minPurchaseAmount);
  }

  if (forCreate) {
    const now = new Date();
    if (!payload.validFrom) {
      payload.validFrom = now;
    }
    if (!payload.validUntil) {
      payload.validUntil = new Date(now.getTime() + DEFAULT_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
    }
    if (payload.maxUsage === undefined) {
      payload.maxUsage = null;
    }
    if (!payload.applicableTo) {
      payload.applicableTo = 'all';
    }
  }

  return payload;
};

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return String(value._id || value.id || '');
  return String(value);
};

const hasContextMatch = (applicableIds, providedIds) => {
  if (!Array.isArray(applicableIds) || applicableIds.length === 0) return true;
  const applicableSet = new Set(applicableIds.map(normalizeId).filter(Boolean));
  return providedIds.some((id) => applicableSet.has(normalizeId(id)));
};

export const create = async (data, createdBy) => Discount.create({
  ...normalizeDiscountPayload(data, { forCreate: true }),
  createdBy,
});

export const getAll = async ({ page = 1, limit = 20, isActive }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive !== 'false';
  const skip = (page - 1) * limit;
  const [discounts, total] = await Promise.all([
    Discount.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Discount.countDocuments(filter),
  ]);
  return { discounts, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const d = await Discount.findById(id);
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const update = async (id, data) => {
  const d = await Discount.findByIdAndUpdate(id, normalizeDiscountPayload(data), { new: true, runValidators: true });
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const toggle = async (id) => {
  const d = await Discount.findById(id);
  if (!d) throw ApiError.notFound('Discount not found');

  d.isActive = !d.isActive;
  await d.save();
  return d;
};

export const remove = async (id) => {
  const d = await Discount.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const validate = async (input, orderAmount = 0, context = {}) => {
  const payload = typeof input === 'object' && input !== null
    ? input
    : { code: input, orderAmount, ...context };

  const code = String(payload.code || '').trim().toUpperCase();
  const amount = Number(payload.orderAmount ?? orderAmount ?? 0);
  const planIds = Array.isArray(payload.planIds) ? payload.planIds : [];
  const productIds = Array.isArray(payload.productIds) ? payload.productIds : [];

  const discount = await Discount.findOne({ code });
  if (!discount) throw ApiError.notFound('Discount code not found');

  const matchesPlanContext = discount.applicableTo !== 'plan' || hasContextMatch(discount.applicableIds, planIds);
  const matchesProductContext = discount.applicableTo !== 'product' || hasContextMatch(discount.applicableIds, productIds);
  const hasRequiredContext = discount.applicableTo === 'all'
    || (discount.applicableTo === 'plan' && planIds.length > 0 && matchesPlanContext)
    || (discount.applicableTo === 'product' && productIds.length > 0 && matchesProductContext);

  if (!discount.isValid(amount) || !hasRequiredContext) {
    throw ApiError.badRequest('Discount code is invalid, expired, or not applicable');
  }
  return discount;
};
