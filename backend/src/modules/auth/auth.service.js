import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './auth.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { emailQueue } from '../../config/bullmq.js';
import logger from '../../utils/logger.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const VERIFICATION_TOKEN_TTL_MS = 5 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const buildFrontendUrl = (path) => `${process.env.FRONTEND_URL || 'http://localhost:3000'}${path}`;

const AUTH_EMAIL_PRIORITY = {
  'auth-password-reset': 1,
  'auth-otp': 2,
  'auth-customer-invite': 2,
  'auth-verification': 3,
};

const queueEmail = async (jobName, payload, options = {}) => {
  try {
    logger.info(`[AuthEmail] Queueing ${jobName} for ${payload.email || payload.userId}`);
    const priority = AUTH_EMAIL_PRIORITY[jobName] || 5;
    await emailQueue.add(
      jobName,
      {
        ...payload,
        enqueuedAt: Date.now(),
      },
      {
        priority,
        ...options,
      }
    );
    logger.info(`[AuthEmail] Queued ${jobName} for ${payload.email || payload.userId}`);
  } catch (error) {
    logger.error(`[AuthEmail] Failed to queue ${jobName}: ${error.message}`);
  }
};

const createVerificationToken = async (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = hashValue(token);
  user.emailVerificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save({ validateBeforeSave: false });
  return token;
};

const createOtpCode = async (user, purpose) => {
  const otp = String(crypto.randomInt(100000, 1000000));
  user.emailOtpToken = hashValue(otp);
  user.emailOtpExpires = new Date(Date.now() + OTP_TTL_MS);
  user.emailOtpPurpose = purpose;
  user.emailOtpAttempts = 0;
  user.emailOtpSentAt = new Date();
  await user.save({ validateBeforeSave: false });
  return otp;
};

const queueVerificationEmail = async (user) => {
  if (!user?.email) return;
  const token = await createVerificationToken(user);
  await queueEmail('auth-verification', {
    userId: user._id.toString(),
    token,
    email: user.email,
    name: user.name,
    verifyUrl: buildFrontendUrl(`/verify-email?token=${token}`),
  });
};

const queueOtpEmail = async (user, purpose) => {
  if (!user?.email) return;
  const otp = await createOtpCode(user, purpose);
  await queueEmail('auth-otp', {
    userId: user._id.toString(),
    otp,
    purpose,
    email: user.email,
    name: user.name,
    verifyUrl: buildFrontendUrl(`/verify-otp?email=${encodeURIComponent(user.email)}&purpose=${purpose}`),
  });
};

const queuePasswordResetEmail = async (user, resetToken) => {
  if (!user?.email) return;

  await queueEmail('auth-password-reset', {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    resetUrl: buildFrontendUrl(`/reset-password/${resetToken}`),
  });
};

export const register = async (body) => {
  const existing = await User.findOne({ email: body.email });
  if (existing) throw ApiError.conflict('Email already registered');

  // First registered user automatically becomes admin (bootstrap)
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : (body.role || 'portal_user');

  const user = await User.create({ ...body, role });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  await queueVerificationEmail(user);

  return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact support.');
  if (!user.emailVerified) throw ApiError.forbidden('Please verify your email before logging in.');

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: { _id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken };
};

export const refreshTokens = async (token) => {
  if (!token) throw ApiError.unauthorized('Refresh token required');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized('Refresh token mismatch');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  // Always respond OK (don't reveal if user exists)
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  await queuePasswordResetEmail(user, resetToken);
  return resetToken;
};

export const sendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;
  await queueVerificationEmail(user);
};

export const inviteCustomer = async ({ name, email }, invitedBy) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const inviter = invitedBy ? await User.findById(invitedBy).select('name email') : null;

  const tempPassword = crypto.randomBytes(24).toString('hex');
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: tempPassword,
    role: 'portal_user',
    createdBy: invitedBy,
  });

  const inviteToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(inviteToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await queueEmail('auth-customer-invite', {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    invitedBy: invitedBy?.toString?.() || String(invitedBy || ''),
    invitedByName: inviter?.name || 'Plano Admin',
    acceptUrl: buildFrontendUrl(`/reset-password/${inviteToken}`),
  });

  return user;
};

export const verifyEmail = async (token) => {
  const hashedToken = hashValue(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest('Invalid or expired verification token');

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

export const sendOtp = async (email, purpose = 'verify_email') => {
  const user = await User.findOne({ email });
  if (!user) return;

  logger.info(`[AuthEmail] Preparing OTP email for ${email} (${purpose})`);
  await queueOtpEmail(user, purpose);
};

export const verifyOtp = async (email, otp, purpose = 'verify_email') => {
  const hashedOtp = hashValue(otp);
  const user = await User.findOne({
    email,
    emailOtpToken: hashedOtp,
    emailOtpPurpose: purpose,
    emailOtpExpires: { $gt: new Date() },
  });

  if (!user) {
    const existing = await User.findOne({ email });
    if (existing) {
      existing.emailOtpAttempts = (existing.emailOtpAttempts || 0) + 1;
      await existing.save({ validateBeforeSave: false });
    }
    throw ApiError.badRequest('Invalid or expired OTP');
  }

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.emailOtpToken = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpPurpose = undefined;
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  return user;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = newPassword;
  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = new Date();
  await user.save();
};
