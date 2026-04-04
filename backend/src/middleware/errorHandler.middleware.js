import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Global Express error handler.
 * Must be the LAST middleware registered in app.js.
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message, errors = [] } = err;

  // ── Mongoose Errors ─────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate value for field: ${field}`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // ── JWT Errors ──────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // ── CORS Error ──────────────────────────────────
  if (err.message?.startsWith('CORS blocked')) {
    statusCode = 403;
    message = err.message;
  }

  // Log the error
  logger.error({
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?._id || null,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
