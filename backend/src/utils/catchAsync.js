/**
 * Wraps async route handlers and passes errors to Express error handler.
 * Eliminates try/catch boilerplate in controllers.
 *
 * Usage: router.get('/path', catchAsync(async (req, res, next) => { ... }))
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
