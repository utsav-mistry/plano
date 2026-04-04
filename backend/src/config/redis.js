import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnect attempt #${times}, waiting ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

const redis = new Redis(redisOptions);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('ready',   () => logger.info('Redis ready'));
redis.on('error',   (err) => logger.error(`Redis error: ${err.message}`));
redis.on('close',   () => logger.warn('Redis connection closed'));

export default redis;
