import { Worker } from 'bullmq';
import Subscription from '../modules/subscriptions/subscription.model.js';
import { invoiceQueue, emailQueue } from '../config/bullmq.js';
import logger from '../utils/logger.js';
import { SUBSCRIPTION_STATUS } from '../constants/statuses.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const subscriptionWorker = new Worker(
  'subscription-lifecycle',
  async (job) => {
    const { type } = job.data;

    // ── Daily Renewal Check ───────────────────────────────────
    if (type === 'renewal') {
      logger.info('[SubscriptionWorker] Running daily renewal check...');

      const now = new Date();
      const dueForRenewal = await Subscription.find({
        status: SUBSCRIPTION_STATUS.ACTIVE,
        autoRenew: true,
        nextBillingDate: { $lte: now },
      }).populate('planId', 'billingCycle price');

      logger.info(`[SubscriptionWorker] Found ${dueForRenewal.length} subscriptions to renew`);

      for (const sub of dueForRenewal) {
        try {
          // Queue invoice generation for the renewal
          await invoiceQueue.add('generate-invoice', {
            subscriptionId: sub._id.toString(),
            userId: sub.userId.toString(),
          });

          // Advance next billing date
          const next = new Date(sub.nextBillingDate);
          const cycle = sub.planId?.billingCycle;
          if (cycle === 'monthly')     next.setMonth(next.getMonth() + 1);
          if (cycle === 'quarterly')   next.setMonth(next.getMonth() + 3);
          if (cycle === 'semi_annual') next.setMonth(next.getMonth() + 6);
          if (cycle === 'annual')      next.setFullYear(next.getFullYear() + 1);

          sub.nextBillingDate = next;
          sub.endDate = next;
          await sub.save();

          logger.info(`[SubscriptionWorker] Renewed subscription ${sub._id}, next billing: ${next.toDateString()}`);
        } catch (err) {
          logger.error(`[SubscriptionWorker] Failed to renew ${sub._id}: ${err.message}`);
        }
      }

      return { renewed: dueForRenewal.length };
    }

    // ── Expiry Warning ────────────────────────────────────────
    if (type === 'expiry-warning') {
      logger.info('[SubscriptionWorker] Running expiry warning check...');

      const warningDays = [3, 7];
      let warned = 0;

      for (const days of warningDays) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);

        const expiringSoon = await Subscription.find({
          status: SUBSCRIPTION_STATUS.ACTIVE,
          autoRenew: false,
          endDate: {
            $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
            $lte: new Date(targetDate.setHours(23, 59, 59, 999)),
          },
        });

        for (const sub of expiringSoon) {
          await emailQueue.add('subscription-expiry-warning', {
            userId: sub.userId.toString(),
            subscriptionId: sub._id.toString(),
            daysLeft: days,
            expiryDate: sub.endDate.toDateString(),
          });
          warned++;
        }
      }

      logger.info(`[SubscriptionWorker] Sent ${warned} expiry warnings`);
      return { warned };
    }

    logger.warn(`[SubscriptionWorker] Unknown job type: ${type}`);
  },
  {
    connection,
    concurrency: 2, // Sequential to avoid race conditions
  }
);

subscriptionWorker.on('completed', (job, result) =>
  logger.info(`[SubscriptionWorker] Job ${job.id} (${job.data?.type}) done`, result)
);

subscriptionWorker.on('failed', (job, err) =>
  logger.error(`[SubscriptionWorker] Job ${job.id} failed: ${err.message}`)
);

export default subscriptionWorker;
