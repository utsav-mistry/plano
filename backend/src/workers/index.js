/**
 * Worker entry point — started as a separate PM2 process.
 * Imports and activates all workers so they connect to BullMQ.
 */
import 'dotenv/config';

import logger from '../utils/logger.js';
import connectDB from '../config/db.js';
import { closeBullMQResources } from '../config/bullmq.js';

const startWorkers = async () => {
  logger.info('Starting BullMQ workers...');
  await connectDB();

  const [{ default: invoiceWorker }, { default: emailWorker }, { default: subscriptionWorker }] = await Promise.all([
    import('./invoice.worker.js'),
    import('./email.worker.js'),
    import('./subscription.worker.js'),
  ]);

  const workers = [invoiceWorker, emailWorker, subscriptionWorker];
  await Promise.all(workers.map((worker) => worker.waitUntilReady()));

  logger.info('All BullMQ workers started');

  const shutdown = async (signal) => {
    logger.warn(`Workers shutting down (${signal})`);
    await Promise.allSettled(workers.map((worker) => worker.close()));
    await closeBullMQResources();
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
};

startWorkers().catch((error) => {
  logger.error(`Worker startup failed: ${error.message}`);
  process.exit(1);
});
