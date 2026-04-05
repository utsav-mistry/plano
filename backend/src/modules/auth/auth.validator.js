import Joi from 'joi';

const strongPassword = Joi.string()
  .min(9)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[a-z]/, 'lowercase letter')
  .pattern(/[^A-Za-z0-9]/, 'special character');

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: strongPassword.required(),
  // Public signup can only create portal users.
  role: Joi.string().valid('portal_user').default('portal_user'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const inviteCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const sendVerificationEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().min(20).required(),
});

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().valid('verify_email', 'login').default('verify_email'),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required(),
  purpose: Joi.string().valid('verify_email', 'login').default('verify_email'),
});

export const resetPasswordSchema = Joi.object({
  password: strongPassword.required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    .messages({ 'any.only': 'Passwords do not match' }),
});
