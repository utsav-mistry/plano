import * as paymentService from './payment.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { ROLES } from '../../constants/roles.js';

export const create = catchAsync(async (req, res) => {
  // FIX [C3]: Portal users can only create payments for their own invoices
  if (req.user.role === ROLES.PORTAL_USER) {
    req.body.userId = req.user._id; // Force portal_user to use their own ID
  }
  const payment = await paymentService.create({ ...req.body, userId: req.body.userId || req.user._id });
  new ApiResponse(201, { payment }, 'Payment recorded').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) req.query.userId = req.user._id;
  const result = await paymentService.getAll(req.query);
  new ApiResponse(200, result, 'Payments fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const payment = await paymentService.getById(req.params.id);
  if (req.user.role === ROLES.PORTAL_USER && payment.userId._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }
  new ApiResponse(200, { payment }, 'Payment fetched').send(res);
});

export const refund = catchAsync(async (req, res) => {
  const payment = await paymentService.refund(req.params.id, req.body);
  new ApiResponse(200, { payment }, 'Refund processed').send(res);
});

export const webhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const result = await paymentService.handleWebhook(req.params.gateway, {
    body: req.body,
    signature,
    rawBody: req.rawBody,
  });
  res.status(200).json(result);
});

export const verifyRazorpayCheckout = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    req.body.userId = req.user._id;
  }
  const result = await paymentService.verifyRazorpayCheckoutAndRecord({
    ...req.body,
    userId: req.body.userId || req.user._id,
  });
  new ApiResponse(200, result, 'Checkout verified and payment recorded').send(res);
});

export const checkoutAudit = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    req.query.userId = req.user._id;
  }
  const result = await paymentService.getCheckoutAudit(req.query);
  new ApiResponse(200, result, 'Checkout audit fetched').send(res);
});

export const createRazorpayOrder = catchAsync(async (req, res) => {
  const result = await paymentService.createRazorpayOrder(req.body || {});
  new ApiResponse(200, { order: result }, 'Razorpay order created').send(res);
});
