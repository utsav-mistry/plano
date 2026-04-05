import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import User from '../modules/users/user.model.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Verifies JWT from Authorization header and attaches user to req.user
 */
export const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw ApiError.unauthorized('Access token required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');
  if (!user.emailVerified) throw ApiError.forbidden('Please verify your email address');

  // FIX [AUDIT-L6]: Invalidate JWTs issued before a password change
  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was recently changed. Please log in again.');
  }

  req.user = user;
  next();
});

/**
 * Role-based authorization middleware.
 * Usage: authorize(ROLES.ADMIN, ROLES.INTERNAL_USER)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

/**
 * Ownership check — Allows portal users to only access their own resources.
 * Usage: authorizeOwnership('userId')
 */
export const authorizeOwnership = (field = 'userId') => {
  return (req, res, next) => {
    const { user } = req;
    if (user.role === ROLES.ADMIN || user.role === ROLES.INTERNAL_USER) {
      return next();
    }
    // Portal users: check that the resource belongs to them
    const resourceUserId = req.params.userId || req.body[field];
    if (resourceUserId && resourceUserId.toString() !== user._id.toString()) {
      return next(ApiError.forbidden('Access denied to this resource'));
    }
    next();
  };
};
