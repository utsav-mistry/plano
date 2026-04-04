import { Queue, QueueEvents } from 'bullmq';
import logger from '../utils/logger.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: { count: 100, age: 86400 },
  removeOnFail: { count: 500 },
};

export const invoiceQueue = new Queue('invoice-generation', { connection, defaultJobOptions });
export const emailQueue = new Queue('email-notification', { connection, defaultJobOptions });
export const subscriptionQueue = new Queue('subscription-lifecycle', { connection, defaultJobOptions });
export const pdfQueue = new Queue('pdf-generation', { connection, defaultJobOptions });

let queueEventsInitialized = false;
let scheduledJobsInitialized = false;
const queueEvents = new Map();

/** Register scheduled (cron) jobs — called once on server start */
export const initScheduledJobs = async () => {
  if (scheduledJobsInitialized) return;

  // Daily at midnight — auto-renew subscriptions
  await subscriptionQueue.add(
    'daily-renewal-check',
    { type: 'renewal' },
    { repeat: { cron: '0 0 * * *' }, jobId: 'daily-renewal-check' }
  );

  // Daily at 9am — warn users 3 & 7 days before expiry
  await subscriptionQueue.add(
    'daily-expiry-warning',
    { type: 'expiry-warning' },
    { repeat: { cron: '0 9 * * *' }, jobId: 'daily-expiry-warning' }
  );

  scheduledJobsInitialized = true;
  logger.info('BullMQ scheduled jobs initialized');
};

// Attach event listeners for observability
const attachQueueEvents = (queue) => {
  if (queueEvents.has(queue.name)) return queueEvents.get(queue.name);

  const events = new QueueEvents(queue.name, { connection });
  events.on('completed', ({ jobId }) =>
    logger.info(`[Queue:${queue.name}] Job ${jobId} completed`)
  );
  events.on('failed', ({ jobId, failedReason }) =>
    logger.error(`[Queue:${queue.name}] Job ${jobId} failed: ${failedReason}`)
  );

  queueEvents.set(queue.name, events);
  return events;
};

export const initQueueEventListeners = async () => {
  if (queueEventsInitialized) return;

  const events = [invoiceQueue, emailQueue, subscriptionQueue, pdfQueue].map(attachQueueEvents);
  await Promise.all(events.map((event) => event.waitUntilReady()));

  queueEventsInitialized = true;
  logger.info('BullMQ queue event listeners initialized');
};

export const closeBullMQResources = async () => {
  const tasks = [];

  for (const events of queueEvents.values()) {
    tasks.push(events.close());
  }

  tasks.push(invoiceQueue.close());
  tasks.push(emailQueue.close());
  tasks.push(subscriptionQueue.close());
  tasks.push(pdfQueue.close());

  await Promise.allSettled(tasks);
  queueEvents.clear();
  queueEventsInitialized = false;
  scheduledJobsInitialized = false;
  logger.info('BullMQ resources closed');
};
