import Subscription from '../subscriptions/subscription.model.js';
import Invoice from '../invoices/invoice.model.js';
import Payment from '../payments/payment.model.js';
import User from '../users/user.model.js';
import { SUBSCRIPTION_STATUS, INVOICE_STATUS, PAYMENT_STATUS } from '../../constants/statuses.js';

/**
 * Revenue report — total revenue in a date range, grouped by day/month
 */
export const revenueReport = async ({ from, to, groupBy = 'month' }) => {
  const match = {
    status: PAYMENT_STATUS.SUCCESS,
    createdAt: {
      $gte: new Date(from || new Date().setFullYear(new Date().getFullYear() - 1)),
      $lte: new Date(to || new Date()),
    },
  };

  const groupFormat = groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m';

  const revenue = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
        totalRevenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totals = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        avgTransactionValue: { $avg: '$amount' },
      },
    },
  ]);

  return { revenue, summary: totals[0] || { totalRevenue: 0, totalTransactions: 0, avgTransactionValue: 0 } };
};

/**
 * MRR — Monthly Recurring Revenue
 * Sum of all active subscription grandTotals normalized to monthly
 */
export const mrrReport = async () => {
  const CYCLE_MULTIPLIERS = { monthly: 1, quarterly: 1 / 3, semi_annual: 1 / 6, annual: 1 / 12 };

  const subs = await Subscription.find({ status: SUBSCRIPTION_STATUS.ACTIVE }).populate('planId', 'billingCycle');

  let mrr = 0;
  for (const sub of subs) {
    const multiplier = CYCLE_MULTIPLIERS[sub.planId?.billingCycle] ?? 1;
    mrr += sub.grandTotal * multiplier;
  }

  const arr = mrr * 12;
  return { mrr: +mrr.toFixed(2), arr: +arr.toFixed(2), activeSubscriptions: subs.length };
};

/**
 * Churn report — cancelled subscriptions in a period
 */
export const churnReport = async ({ from, to }) => {
  const match = {
    status: SUBSCRIPTION_STATUS.CANCELLED,
    cancelledAt: {
      $gte: new Date(from || new Date().setMonth(new Date().getMonth() - 6)),
      $lte: new Date(to || new Date()),
    },
  };

  const [cancelled, active] = await Promise.all([
    Subscription.countDocuments(match),
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
  ]);

  const churnRate = active + cancelled > 0
    ? +((cancelled / (active + cancelled)) * 100).toFixed(2)
    : 0;

  const byReason = await Subscription.aggregate([
    { $match: match },
    { $group: { _id: '$cancellationReason', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return { cancelled, active, churnRate, byReason };
};

/**
 * Subscription overview report
 */
export const subscriptionReport = async () => {
  const statusBreakdown = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const newThisMonth = await Subscription.countDocuments({
    createdAt: { $gte: new Date(new Date().setDate(1)) },
  });

  return { statusBreakdown, newThisMonth };
};

/**
 * Invoice summary — paid vs overdue
 */
export const invoiceReport = async ({ from, to }) => {
  const dateFilter = {
    createdAt: {
      $gte: new Date(from || new Date().setMonth(new Date().getMonth() - 3)),
      $lte: new Date(to || new Date()),
    },
  };

  const breakdown = await Invoice.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$grandTotal' },
      },
    },
  ]);

  const overdueCount = await Invoice.countDocuments({
    status: INVOICE_STATUS.SENT,
    dueDate: { $lt: new Date() },
  });

  return { breakdown, overdueCount };
};

/**
 * User growth report
 */
export const userGrowthReport = async ({ from, to }) => {
  const match = {
    createdAt: {
      $gte: new Date(from || new Date().setFullYear(new Date().getFullYear() - 1)),
      $lte: new Date(to || new Date()),
    },
  };

  const growth = await User.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  return { growth, byRole, total: await User.countDocuments() };
};
