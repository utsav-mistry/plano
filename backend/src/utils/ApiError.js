export class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg, errors) {
    return new ApiError(400, msg || 'Bad Request', errors);
  }

  static unauthorized(msg) {
    return new ApiError(401, msg || 'Unauthorized');
  }

  static forbidden(msg) {
    return new ApiError(403, msg || 'Forbidden');
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Resource not found');
  }

  static conflict(msg) {
    return new ApiError(409, msg || 'Conflict');
  }

  static unprocessable(msg, errors) {
    return new ApiError(422, msg || 'Validation failed', errors);
  }

  static tooManyRequests(msg) {
    return new ApiError(429, msg || 'Too many requests');
  }

  static internal(msg) {
    return new ApiError(500, msg || 'Internal server error');
  }
}
