import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import redis from './src/config/redis.js';
import { closeBullMQResources, initQueueEventListeners, initScheduledJobs } from './src/config/bullmq.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Database connected');

    // Initialize BullMQ scheduled jobs
    await initScheduledJobs();
    await initQueueEventListeners();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`API: http://localhost:${PORT}/api/v1`);
      if (process.env.SWAGGER_ENABLED === 'true') {
        logger.info(`Docs: http://localhost:${PORT}/api-docs`);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closeBullMQResources();
        await redis.quit();
        logger.info('Redis disconnected');
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error(`Unhandled Rejection: ${reason}`);
    });

    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
