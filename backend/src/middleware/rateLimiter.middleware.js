import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';

const createLimiter = ({ windowMs, max, message, prefix }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // RateLimit-* headers
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: `rl:${prefix}:`,
    }),
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please slow down.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  });

/** Default: 100 requests per 15 minutes */
export const globalLimiter = createLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  prefix: 'global',
});

/** Auth: 10 attempts per 15 minutes */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  prefix: 'auth',
});

/** Payment: 20 requests per hour */
export const paymentLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Payment request limit exceeded.',
  prefix: 'payment',
});

/** Reports: 10 per hour (heavy queries) */
export const reportLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Report generation limit exceeded. Try again later.',
  prefix: 'report',
});
