import Quotation from './quotation.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { QUOTATION_STATUS } from '../../constants/statuses.js';
import { ROLES } from '../../constants/roles.js';
import * as subscriptionService from '../subscriptions/subscription.service.js';

const normalizeObjectId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return String(value._id || value.id || '');
  return String(value);
};

const generateQuotationNumber = () => {
  const date = new Date();
  return `QUO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;
};

const markOverdueAsExpired = async (baseFilter = {}) => {
  const now = new Date();
  await Quotation.updateMany(
    {
      ...baseFilter,
      validUntil: { $lt: now },
      status: { $in: [QUOTATION_STATUS.DRAFT, QUOTATION_STATUS.SENT] },
    },
    {
      $set: {
        status: QUOTATION_STATUS.EXPIRED,
        negotiationState: 'resolved',
      },
    }
  );
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
    negotiationState: data.negotiationState || 'none',
    createdBy,
  });
};

export const getAll = async ({ page = 1, limit = 20, status, userId }) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  await markOverdueAsExpired(userId ? { userId } : {});

  const skip = (page - 1) * limit;
  const [quotations, total] = await Promise.all([
    Quotation.find(filter).populate('userId', 'name email').skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Quotation.countDocuments(filter),
  ]);
  return { quotations, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  await markOverdueAsExpired();
  const q = await Quotation.findById(id).populate('userId subscriptionId');
  if (!q) throw ApiError.notFound('Quotation not found');
  return q;
};

export const update = async (id, data) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');
  if ([QUOTATION_STATUS.ACCEPTED, QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.CLOSED, QUOTATION_STATUS.EXPIRED].includes(q.status)) {
    throw ApiError.badRequest('Cannot edit a finalized quotation');
  }
  return Quotation.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const send = async (id) => {
  const q = await Quotation.findByIdAndUpdate(
    id,
    { status: QUOTATION_STATUS.SENT, sentAt: new Date(), negotiationState: 'pending_customer' },
    { new: true }
  );
  if (!q) throw ApiError.notFound('Quotation not found');
  return q;
};

const normalizeTotal = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    throw ApiError.badRequest('A valid non-negative amount is required');
  }
  return normalized;
};

const pushNegotiationEvent = (quotation, { actorId, actorRole, action, previousTotal, proposedTotal, note }) => {
  quotation.negotiationHistory = Array.isArray(quotation.negotiationHistory)
    ? quotation.negotiationHistory
    : [];

  quotation.negotiationHistory.push({
    actorId,
    actorRole,
    action,
    previousTotal,
    proposedTotal,
    note: String(note || '').trim(),
    createdAt: new Date(),
  });
};

export const review = async (id, payload, actorUser) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');
  if (q.convertedToSubscription) throw ApiError.conflict('Converted quotations cannot be reviewed');

  const role = actorUser?.role;
  const action = String(payload?.action || '').toLowerCase();
  const note = payload?.note || payload?.comment || '';
  const previousTotal = Number(q.grandTotal || 0);

  if (!['accept', 'reject', 'counter'].includes(action)) {
    throw ApiError.badRequest('Action must be one of: accept, reject, counter');
  }

  if (role === ROLES.ADMIN || role === ROLES.INTERNAL_USER) {
    if ([QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.EXPIRED].includes(q.status)) {
      throw ApiError.badRequest('Cannot review a rejected or expired quotation');
    }

    if (action === 'counter') {
      const proposedTotal = normalizeTotal(payload?.counterAmount, previousTotal);
      q.grandTotal = proposedTotal;
      q.status = QUOTATION_STATUS.SENT;
      q.negotiationState = 'pending_customer';
      pushNegotiationEvent(q, {
        actorId: actorUser._id,
        actorRole: role,
        action,
        previousTotal,
        proposedTotal,
        note,
      });
      await q.save();
      return q;
    }

    if (action === 'accept') {
      q.status = QUOTATION_STATUS.ACCEPTED;
      q.negotiationState = 'resolved';
      q.acceptedAt = new Date();
      pushNegotiationEvent(q, {
        actorId: actorUser._id,
        actorRole: role,
        action,
        previousTotal,
        proposedTotal: previousTotal,
        note,
      });
      await q.save();
      return q;
    }

    q.status = QUOTATION_STATUS.REJECTED;
    q.negotiationState = 'resolved';
    q.rejectedAt = new Date();
    pushNegotiationEvent(q, {
      actorId: actorUser._id,
      actorRole: role,
      action,
      previousTotal,
      proposedTotal: previousTotal,
      note,
    });
    await q.save();
    return q;
  }

  if (role !== ROLES.PORTAL_USER) {
    throw ApiError.forbidden('Only admin/internal or portal users can review quotations');
  }

  const ownerId = q.userId?.toString();
  if (ownerId !== actorUser._id.toString()) {
    throw ApiError.forbidden('You can only respond to your own quotation');
  }

  if ([QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.EXPIRED].includes(q.status)) {
    throw ApiError.badRequest('This quotation can no longer be changed');
  }

  if (action === 'counter') {
    const proposedTotal = normalizeTotal(payload?.counterAmount, previousTotal);
    q.grandTotal = proposedTotal;
    q.status = QUOTATION_STATUS.SENT;
    q.negotiationState = 'pending_admin';
    pushNegotiationEvent(q, {
      actorId: actorUser._id,
      actorRole: role,
      action,
      previousTotal,
      proposedTotal,
      note,
    });
    await q.save();
    return q;
  }

  if (action === 'accept') {
    q.status = QUOTATION_STATUS.ACCEPTED;
    q.negotiationState = 'resolved';
    q.acceptedAt = new Date();
    pushNegotiationEvent(q, {
      actorId: actorUser._id,
      actorRole: role,
      action,
      previousTotal,
      proposedTotal: previousTotal,
      note,
    });
    await q.save();
    return q;
  }

  q.status = QUOTATION_STATUS.REJECTED;
  q.negotiationState = 'resolved';
  q.rejectedAt = new Date();
  pushNegotiationEvent(q, {
    actorId: actorUser._id,
    actorRole: role,
    action,
    previousTotal,
    proposedTotal: previousTotal,
    note,
  });
  await q.save();
  return q;
};

export const convert = async (id, createdBy) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');
  if (q.convertedToSubscription) throw ApiError.conflict('Already converted to a subscription');
  if (q.status !== QUOTATION_STATUS.ACCEPTED) throw ApiError.badRequest('Only accepted quotations can be converted');

  const recurringItems = Array.isArray(q.items)
    ? q.items.filter((item) => normalizeObjectId(item.planId))
    : [];

  if (recurringItems.length === 0) {
    throw ApiError.badRequest('Quotation does not contain a recurring plan item to convert');
  }

  const uniquePlanIds = new Set(recurringItems.map((item) => normalizeObjectId(item.planId)).filter(Boolean));
  if (uniquePlanIds.size > 1) {
    throw ApiError.badRequest('Quotation contains multiple recurring plans. Split it before converting.');
  }

  const planId = normalizeObjectId(recurringItems[0].planId);
  const quantity = recurringItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);

  const subscription = await subscriptionService.create({
    userId: normalizeObjectId(q.userId),
    planId,
    quantity,
    autoRenew: true,
    billingAddress: q.billingAddress || '',
  }, createdBy);

  q.convertedToSubscription = true;
  q.subscriptionId = subscription._id;
  await q.save();
  return q;
};

export const close = async (id, payload, actorUser) => {
  const q = await Quotation.findById(id);
  if (!q) throw ApiError.notFound('Quotation not found');

  if (q.convertedToSubscription) {
    throw ApiError.conflict('Converted quotations cannot be closed');
  }

  if ([QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.CLOSED, QUOTATION_STATUS.EXPIRED].includes(q.status)) {
    throw ApiError.badRequest('Quotation is already finalized');
  }

  q.status = QUOTATION_STATUS.CLOSED;
  q.negotiationState = 'resolved';
  q.closedAt = new Date();
  q.closeReason = String(payload?.reason || payload?.note || '').trim();

  pushNegotiationEvent(q, {
    actorId: actorUser._id,
    actorRole: actorUser.role,
    action: 'reject',
    previousTotal: Number(q.grandTotal || 0),
    proposedTotal: Number(q.grandTotal || 0),
    note: q.closeReason || 'Quotation closed',
  });

  await q.save();
  return q;
};

export const createUpsell = async (id, payload, actorUser) => {
  const source = await Quotation.findById(id);
  if (!source) throw ApiError.notFound('Quotation not found');

  if ([QUOTATION_STATUS.CLOSED, QUOTATION_STATUS.REJECTED, QUOTATION_STATUS.EXPIRED].includes(source.status)) {
    throw ApiError.badRequest('Cannot create an upsell from a finalized quotation');
  }

  const sourceItems = Array.isArray(source.items) ? source.items : [];
  if (sourceItems.length === 0) {
    throw ApiError.badRequest('Source quotation has no items to upsell');
  }

  const sourceTotal = Number(source.grandTotal || 0);
  const requestedAmount = payload?.targetAmount !== undefined ? Number(payload.targetAmount) : NaN;
  const increasePercent = payload?.increasePercent !== undefined ? Number(payload.increasePercent) : NaN;

  let targetTotal = sourceTotal;
  if (Number.isFinite(requestedAmount) && requestedAmount >= 0) {
    targetTotal = requestedAmount;
  } else if (Number.isFinite(increasePercent)) {
    targetTotal = Math.max(0, sourceTotal + (sourceTotal * increasePercent) / 100);
  } else {
    targetTotal = Math.max(0, sourceTotal * 1.1);
  }

  const factor = sourceTotal > 0 ? (targetTotal / sourceTotal) : 1;

  const newItems = sourceItems.map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0) * factor;
    const discountValue = Number(item.discountValue || 0);
    const taxValue = Number(item.taxValue || 0);
    const total = Math.max(quantity * unitPrice - discountValue + taxValue, 0);

    return {
      ...item.toObject?.() || item,
      quantity,
      unitPrice,
      discountValue,
      taxValue,
      total,
    };
  });

  const subtotal = newItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const discountTotal = newItems.reduce((sum, item) => sum + Number(item.discountValue || 0), 0);
  const taxTotal = newItems.reduce((sum, item) => sum + Number(item.taxValue || 0), 0);
  const grandTotal = Math.max(subtotal - discountTotal + taxTotal, 0);

  const upsell = await Quotation.create({
    quotationNumber: generateQuotationNumber(),
    userId: source.userId,
    items: newItems,
    subtotal,
    discountTotal,
    taxTotal,
    grandTotal,
    currency: source.currency,
    status: QUOTATION_STATUS.SENT,
    validUntil: payload?.validUntil ? new Date(payload.validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    notes: payload?.note || source.notes,
    terms: source.terms,
    isUpsell: true,
    upsellFromQuotationId: source._id,
    upsellInitiatedBy: actorUser._id,
    negotiationState: actorUser.role === ROLES.PORTAL_USER ? 'pending_admin' : 'pending_customer',
    createdBy: actorUser._id,
  });

  source.negotiationState = 'resolved';
  await source.save();

  return upsell;
};
