import * as subscriptionService from './subscription.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { ROLES } from '../../constants/roles.js';

export const create = catchAsync(async (req, res) => {
  // Portal users can only create subscriptions for themselves
  if (req.user.role === ROLES.PORTAL_USER) {
    req.body.userId = req.user._id;
  }
  if (!req.body.userId) throw ApiError.badRequest('userId is required');
  const subscription = await subscriptionService.create(req.body, req.user._id);
  new ApiResponse(201, { subscription }, 'Subscription created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  // Portal users can only see their own subscriptions
  if (req.user.role === ROLES.PORTAL_USER) {
    req.query.userId = req.user._id;
  }
  const result = await subscriptionService.getAll(req.query);
  new ApiResponse(200, result, 'Subscriptions fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.getById(req.params.id);
  if (req.user.role === ROLES.PORTAL_USER && subscription.userId._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }
  new ApiResponse(200, { subscription }, 'Subscription fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    const sub = await subscriptionService.getById(req.params.id);
    const ownerId = sub.userId?._id?.toString() || sub.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only update your own subscriptions');
    }
  }
  const subscription = await subscriptionService.update(req.params.id, req.body);
  new ApiResponse(200, { subscription }, 'Subscription updated').send(res);
});

export const confirm = catchAsync(async (req, res) => {
  // Compatibility route for frontend flow: confirm maps to activation behavior.
  const subscription = await subscriptionService.activate(req.params.id);
  new ApiResponse(200, { subscription }, 'Subscription confirmed').send(res);
});

export const activate = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.activate(req.params.id);
  new ApiResponse(200, { subscription }, 'Subscription activated').send(res);
});

export const cancel = catchAsync(async (req, res) => {
  // FIX [C1]: Portal users can only cancel their own subscriptions
  if (req.user.role === ROLES.PORTAL_USER) {
    const sub = await subscriptionService.getById(req.params.id);
    const ownerId = sub.userId?._id?.toString() || sub.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only cancel your own subscriptions');
    }
  }
  const subscription = await subscriptionService.cancel(req.params.id, req.body.reason, req.user._id);
  new ApiResponse(200, { subscription }, 'Subscription cancelled').send(res);
});

export const pause = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.pause(req.params.id);
  new ApiResponse(200, { subscription }, 'Subscription paused').send(res);
});

export const resume = catchAsync(async (req, res) => {
  const subscription = await subscriptionService.resume(req.params.id);
  new ApiResponse(200, { subscription }, 'Subscription resumed').send(res);
});
