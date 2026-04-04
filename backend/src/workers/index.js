/**
 * Worker entry point — started as a separate PM2 process.
 * Imports and activates all workers so they connect to BullMQ.
 */
import 'dotenv/config';
import './invoice.worker.js';
import './email.worker.js';
import './subscription.worker.js';

import logger from '../utils/logger.js';
import connectDB from '../config/db.js';

const startWorkers = async () => {
  await connectDB();
  logger.info('All BullMQ workers started');

  process.on('SIGTERM', () => {
    logger.warn('Workers shutting down (SIGTERM)');
    process.exit(0);
  });
};

startWorkers();
