import redis from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Redis-backed idempotency middleware.
 *
 * Clients must send `X-Idempotency-Key: <uuid>` header on mutating requests.
 * Duplicate requests with the same key will receive the cached response.
 *
 * TTL: 24 hours — enough to prevent accidental duplicates while allowing
 * legitimate retries after that window.
 */
export const idempotency = async (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'];

  // Skip for non-mutating requests or if no key provided
  if (!idempotencyKey || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const userId = req.user?._id?.toString() || 'anon';
  const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

  try {
    const cached = await redis.get(cacheKey);

    if (cached) {
      logger.info(`[Idempotency] Cache hit for key=${idempotencyKey}`);
      const { status, body } = JSON.parse(cached);
      return res.status(status).json(body);
    }

    // Lock the key immediately to prevent race conditions
    // NX = set only if not exists, EX = expiry in seconds
    await redis.set(`${cacheKey}:lock`, '1', 'EX', 30, 'NX');

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      // Only cache successful responses
      if (res.statusCode < 400) {
        await redis.set(
          cacheKey,
          JSON.stringify({ status: res.statusCode, body }),
          'EX',
          86400 // 24 hours
        );
        logger.info(`[Idempotency] Cached key=${idempotencyKey} status=${res.statusCode}`);
      }
      await redis.del(`${cacheKey}:lock`);
      return originalJson(body);
    };

    next();
  } catch (err) {
    logger.error(`[Idempotency] Redis error: ${err.message}`);
    // Fail open — don't break the request if Redis is down
    next();
  }
};
