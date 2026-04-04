import Joi from 'joi';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validation middleware factory.
 * Validates req.body, req.params, or req.query against a Joi schema.
 *
 * Usage:
 *   router.post('/path', validate(schema), controller)
 *   router.get('/path', validate(schema, 'query'), controller)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
      return next(ApiError.unprocessable('Validation failed', errors));
    }

    req[source] = value; // Replace with sanitized value
    next();
  };
};

export default validate;
