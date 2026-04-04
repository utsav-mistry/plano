import * as authService from './auth.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // 'strict' blocks the cookie on cross-origin requests (localhost:3000 → localhost:5000).
  // Use 'lax' in development so the refresh token cookie is sent during token rotation.
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email already exists }
 */
export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  new ApiResponse(201, { user, token: accessToken }, 'Registration successful').send(res);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  new ApiResponse(200, { user, token: accessToken }, 'Login successful').send(res);
});

export const inviteCustomer = catchAsync(async (req, res) => {
  const user = await authService.inviteCustomer(req.body, req.user._id);
  new ApiResponse(201, { user }, 'Customer invited successfully').send(res);
});

export const sendVerificationEmail = catchAsync(async (req, res) => {
  await authService.sendVerificationEmail(req.body.email);
  new ApiResponse(200, null, 'Verification email queued').send(res);
});

export const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.body.token);
  new ApiResponse(200, { user }, 'Email verified successfully').send(res);
});

export const sendOtp = catchAsync(async (req, res) => {
  await authService.sendOtp(req.body.email, req.body.purpose);
  new ApiResponse(200, null, 'OTP email queued').send(res);
});

export const verifyOtp = catchAsync(async (req, res) => {
  const user = await authService.verifyOtp(req.body.email, req.body.otp, req.body.purpose);
  new ApiResponse(200, { user }, 'OTP verified successfully').send(res);
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id);
  res.clearCookie('refreshToken');
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, refreshToken: newRefresh } = await authService.refreshTokens(token);
  res.cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  new ApiResponse(200, { token: accessToken }, 'Token refreshed').send(res);
});

export const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  new ApiResponse(200, null, 'If that email exists, a reset link has been sent').send(res);
});

export const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  new ApiResponse(200, null, 'Password reset successful').send(res);
});

export const getMe = catchAsync(async (req, res) => {
  // Return the user object directly so frontend can read response.data as User
  new ApiResponse(200, req.user, 'Profile fetched').send(res);
});
