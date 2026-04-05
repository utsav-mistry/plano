import Subscription from './subscription.model.js';
import Plan from '../plans/plan.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { SUBSCRIPTION_STATUS, BILLING_CYCLE } from '../../constants/statuses.js';
import { invoiceQueue } from '../../config/bullmq.js';

/**
 * Calculate the next billing date based on billing cycle
 */
const calcNextBillingDate = (fromDate, billingCycle) => {
  const date = new Date(fromDate);
  switch (billingCycle) {
    case BILLING_CYCLE.MONTHLY: date.setMonth(date.getMonth() + 1); break;
    case BILLING_CYCLE.QUARTERLY: date.setMonth(date.getMonth() + 3); break;
    case BILLING_CYCLE.SEMI_ANNUAL: date.setMonth(date.getMonth() + 6); break;
    case BILLING_CYCLE.ANNUAL: date.setFullYear(date.getFullYear() + 1); break;
    default: throw ApiError.badRequest(`Unknown billing cycle: ${billingCycle}`);
  }
  return date;
};

export const create = async (data, createdBy) => {
  const plan = await Plan.findById(data.planId).populate('discountIds taxIds');
  if (!plan) throw ApiError.notFound('Plan not found');
  if (!plan.isActive) throw ApiError.badRequest('Selected plan is not active');

  const startDate = new Date();
  let status = SUBSCRIPTION_STATUS.ACTIVE;
  let trialEndsAt;

  // Handle trial period
  if (plan.trialDays > 0) {
    status = SUBSCRIPTION_STATUS.TRIAL;
    trialEndsAt = new Date(startDate);
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);
  }

  const endDate = calcNextBillingDate(startDate, plan.billingCycle);
  const nextBillingDate = calcNextBillingDate(startDate, plan.billingCycle);

  const quantity = data.quantity || 1;
  const unitPrice = plan.price;
  const totalPrice = unitPrice * quantity;

  // Apply discount
  let discountApplied = 0;
  if (data.discountId) {
    const Discount = (await import('../discounts/discount.model.js')).default;
    const discount = await Discount.findById(data.discountId);
    if (discount && discount.isValid(totalPrice)) {
      discountApplied = discount.type === 'percentage'
        ? (totalPrice * discount.value) / 100
        : discount.value;
      await Discount.findByIdAndUpdate(data.discountId, { $inc: { usedCount: 1 } });
    }
  }

  // Apply tax
  let taxApplied = 0;
  for (const tax of plan.taxIds || []) {
    taxApplied += (totalPrice - discountApplied) * (tax.rate / 100);
  }

  const grandTotal = totalPrice - discountApplied + taxApplied;

  const subscription = await Subscription.create({
    userId: data.userId,
    planId: plan._id,
    productId: plan.productId,
    status,
    startDate,
    endDate,
    trialEndsAt,
    nextBillingDate: plan.trialDays > 0 ? trialEndsAt : nextBillingDate,
    autoRenew: data.autoRenew ?? true,
    quantity,
    unitPrice,
    totalPrice,
    discountApplied,
    taxApplied,
    grandTotal,
    currency: plan.currency,
    createdBy,
  });

  // Queue invoice generation (skip during trial)
  if (status === SUBSCRIPTION_STATUS.ACTIVE) {
    await invoiceQueue.add('generate-invoice', {
      subscriptionId: subscription._id.toString(),
      userId: subscription.userId.toString(),
    });
  }

  return subscription;
};

export const getAll = async ({ page = 1, limit = 20, status, userId, autoRenew }) => {
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (autoRenew !== undefined) filter.autoRenew = autoRenew === 'true';
  const skip = (page - 1) * limit;
  const [subscriptions, total] = await Promise.all([
    Subscription.find(filter)
      .populate('userId', 'name email')
      .populate('planId', 'name billingCycle price')
      .populate('productId', 'name type')
      .skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Subscription.countDocuments(filter),
  ]);
  return { subscriptions, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const sub = await Subscription.findById(id)
    .populate('userId', 'name email')
    .populate('planId')
    .populate('productId');
  if (!sub) throw ApiError.notFound('Subscription not found');
  return sub;
};

export const update = async (id, data) => {
  const allowedFields = ['autoRenew', 'quantity', 'nextBillingDate', 'endDate'];
  const patch = Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => allowedFields.includes(key))
  );

  const sub = await Subscription.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  });

  if (!sub) throw ApiError.notFound('Subscription not found');
  return sub;
};

export const activate = async (id) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw ApiError.notFound('Subscription not found');

  if ([SUBSCRIPTION_STATUS.CANCELLED, SUBSCRIPTION_STATUS.EXPIRED].includes(sub.status)) {
    throw ApiError.badRequest('Cannot activate a cancelled or expired subscription');
  }

  const wasActive = sub.status === SUBSCRIPTION_STATUS.ACTIVE;
  sub.status = SUBSCRIPTION_STATUS.ACTIVE;
  sub.resumedAt = new Date();

  if (!sub.nextBillingDate) {
    sub.nextBillingDate = sub.endDate || calcNextBillingDate(new Date(), BILLING_CYCLE.MONTHLY);
  }

  await sub.save();

  // If activation changed state, queue an invoice generation request.
  if (!wasActive) {
    await invoiceQueue.add('generate-invoice', {
      subscriptionId: sub._id.toString(),
      userId: sub.userId.toString(),
    });
  }

  return sub;
};

export const cancel = async (id, reason, cancelledBy) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw ApiError.notFound('Subscription not found');
  if ([SUBSCRIPTION_STATUS.CANCELLED, SUBSCRIPTION_STATUS.EXPIRED].includes(sub.status)) {
    throw ApiError.badRequest('Subscription is already cancelled or expired');
  }
  sub.status = SUBSCRIPTION_STATUS.CANCELLED;
  sub.cancellationReason = reason;
  sub.cancelledAt = new Date();
  sub.autoRenew = false;
  await sub.save();
  return sub;
};

export const pause = async (id) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw ApiError.notFound('Subscription not found');
  if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE) {
    throw ApiError.badRequest('Only active subscriptions can be paused');
  }
  sub.status = SUBSCRIPTION_STATUS.PAUSED;
  sub.pausedAt = new Date();
  await sub.save();
  return sub;
};

export const resume = async (id) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw ApiError.notFound('Subscription not found');
  if (sub.status !== SUBSCRIPTION_STATUS.PAUSED) {
    throw ApiError.badRequest('Only paused subscriptions can be resumed');
  }
  sub.status = SUBSCRIPTION_STATUS.ACTIVE;
  sub.resumedAt = new Date();
  await sub.save();
  return sub;
};
