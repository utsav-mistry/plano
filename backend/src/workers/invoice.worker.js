import { Worker } from 'bullmq';
import Invoice from '../modules/invoices/invoice.model.js';
import Subscription from '../modules/subscriptions/subscription.model.js';
import logger from '../utils/logger.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const generateInvoiceNumber = () =>
  `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;

const invoiceWorker = new Worker(
  'invoice-generation',
  async (job) => {
    const { subscriptionId, userId } = job.data;

    logger.info(`[InvoiceWorker] Processing job ${job.id} for subscription ${subscriptionId}`);

    const subscription = await Subscription.findById(subscriptionId).populate('planId');
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Net-7 terms

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      subscriptionId: subscription._id,
      userId: subscription.userId,
      items: [
        {
          description: `${subscription.planId?.name || 'Subscription'} — ${subscription.billingPeriodLabel || 'Billing Period'}`,
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
      status: 'sent',
      dueDate,
      billingPeriodStart: subscription.startDate,
      billingPeriodEnd: subscription.endDate,
    });

    logger.info(`[InvoiceWorker] Invoice ${invoice.invoiceNumber} created for subscription ${subscriptionId}`);
    return { invoiceId: invoice._id.toString() };
  },
  {
    connection,
    concurrency: parseInt(process.env.BULLMQ_CONCURRENCY) || 5,
  }
);

invoiceWorker.on('completed', (job, result) =>
  logger.info(`[InvoiceWorker] Job ${job.id} completed — Invoice ${result.invoiceId}`)
);

invoiceWorker.on('failed', (job, err) =>
  logger.error(`[InvoiceWorker] Job ${job.id} failed: ${err.message}`)
);

export default invoiceWorker;
