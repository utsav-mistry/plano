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
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const statusBreakdown = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const activeSubs = statusBreakdown.find(s => s._id === SUBSCRIPTION_STATUS.ACTIVE)?.count || 0;

  const expiringThisMonth = await Subscription.countDocuments({
    status: SUBSCRIPTION_STATUS.ACTIVE,
    endDate: { $gte: startOfThisMonth, $lte: endOfThisMonth }
  });

  const overdueInvoices = await Invoice.aggregate([
    { $match: { status: INVOICE_STATUS.SENT, dueDate: { $lt: now } } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  return { 
    activeSubscriptions: activeSubs, 
    expiringThisMonth, 
    overdueRevenue: overdueInvoices[0]?.total || 0,
    statusBreakdown 
  };
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

/**
 * Dashboard KPI stats — all metrics the dashboard needs in one call.
 * Returns current values + month-over-month trend percentages.
 */
export const dashboardStats = async () => {
  const CYCLE_MULTIPLIERS = { monthly: 1, quarterly: 1 / 3, semi_annual: 1 / 6, annual: 1 / 12 };

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo   = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo    = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    activeSubs,
    activeSubsLastMonth,
    allActiveSubs,
    overdueInvoices,
    overdueInvoicesLastMonth,
    newSubs30d,
    newSubs30dPrev,
  ] = await Promise.all([
    // Active subscriptions — this month snapshot
    Subscription.countDocuments({ status: SUBSCRIPTION_STATUS.ACTIVE }),
    // Active subscriptions — last month snapshot (created before this month)
    Subscription.countDocuments({
      status: SUBSCRIPTION_STATUS.ACTIVE,
      createdAt: { $lt: startOfThisMonth },
    }),
    // All active subs for MRR calculation
    Subscription.find({ status: SUBSCRIPTION_STATUS.ACTIVE }).populate('planId', 'billingCycle'),
    // Overdue invoices now
    Invoice.countDocuments({ status: INVOICE_STATUS.SENT, dueDate: { $lt: now } }),
    // Overdue invoices at start of this month (prev snapshot)
    Invoice.countDocuments({ status: INVOICE_STATUS.SENT, dueDate: { $lt: startOfThisMonth } }),
    // New subs in the last 30 days
    Subscription.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    // New subs in the 30 days before that (for trend)
    Subscription.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
  ]);

  // Compute MRR (current)
  let mrr = 0;
  for (const sub of allActiveSubs) {
    const multiplier = CYCLE_MULTIPLIERS[sub.planId?.billingCycle] ?? 1;
    mrr += (sub.grandTotal || 0) * multiplier;
  }

  // Compute last-month MRR using same active subs (approximation — subs created before this month)
  let mrrLastMonth = 0;
  for (const sub of allActiveSubs) {
    if (sub.createdAt < startOfThisMonth) {
      const multiplier = CYCLE_MULTIPLIERS[sub.planId?.billingCycle] ?? 1;
      mrrLastMonth += (sub.grandTotal || 0) * multiplier;
    }
  }

  // Helper: percentage trend (positive = growth, negative = decline)
  const trend = (current, previous) => {
    if (!previous) return current > 0 ? 100 : 0;
    return +((((current - previous) / previous) * 100).toFixed(1));
  };

  return {
    activeSubscriptions:       activeSubs,
    activeSubscriptionsTrend:  trend(activeSubs, activeSubsLastMonth),
    mrr:                       +mrr.toFixed(2),
    arr:                       +(mrr * 12).toFixed(2),
    mrrTrend:                  trend(mrr, mrrLastMonth),
    overdueInvoices:           overdueInvoices,
    overdueInvoicesTrend:      trend(overdueInvoices, overdueInvoicesLastMonth),
    newSubscriptions30d:       newSubs30d,
    newSubscriptions30dTrend:  trend(newSubs30d, newSubs30dPrev),
  };
};

