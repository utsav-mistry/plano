import * as quotationService from './quotation.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { ROLES } from '../../constants/roles.js';

export const create = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    req.body.userId = req.user._id;
    req.body.status = 'sent';
    req.body.negotiationState = 'pending_admin';
  }
  const q = await quotationService.create(req.body, req.user._id);
  new ApiResponse(201, { quotation: q }, 'Quotation created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  // FIX [C5]: Portal users can only see their own quotations
  if (req.user.role === ROLES.PORTAL_USER) {
    req.query.userId = req.user._id;
  }
  const result = await quotationService.getAll(req.query);
  new ApiResponse(200, result, 'Quotations fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const q = await quotationService.getById(req.params.id);
  // FIX [C5]: Portal users can only view their own quotations
  if (req.user.role === ROLES.PORTAL_USER) {
    const ownerId = q.userId?._id?.toString() || q.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied');
    }
  }
  new ApiResponse(200, { quotation: q }, 'Quotation fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const q = await quotationService.update(req.params.id, req.body);
  new ApiResponse(200, { quotation: q }, 'Quotation updated').send(res);
});

export const send = catchAsync(async (req, res) => {
  const q = await quotationService.send(req.params.id);
  new ApiResponse(200, { quotation: q }, 'Quotation sent').send(res);
});

export const convert = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    const quotation = await quotationService.getById(req.params.id);
    const ownerId = quotation.userId?._id?.toString() || quotation.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied');
    }
  }
  const q = await quotationService.convert(req.params.id, req.user._id);
  new ApiResponse(200, { quotation: q }, 'Quotation converted to subscription').send(res);
});

export const review = catchAsync(async (req, res) => {
  const q = await quotationService.review(req.params.id, req.body, req.user);
  new ApiResponse(200, { quotation: q }, 'Quotation reviewed').send(res);
});

export const respond = catchAsync(async (req, res) => {
  const quotation = await quotationService.getById(req.params.id);
  const ownerId = quotation.userId?._id?.toString() || quotation.userId?.toString();
  if (ownerId !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }
  const q = await quotationService.review(req.params.id, req.body, req.user);
  new ApiResponse(200, { quotation: q }, 'Quotation response saved').send(res);
});

export const close = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    const quotation = await quotationService.getById(req.params.id);
    const ownerId = quotation.userId?._id?.toString() || quotation.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const q = await quotationService.close(req.params.id, req.body, req.user);
  new ApiResponse(200, { quotation: q }, 'Quotation closed').send(res);
});

export const upsell = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) {
    const quotation = await quotationService.getById(req.params.id);
    const ownerId = quotation.userId?._id?.toString() || quotation.userId?.toString();
    if (ownerId !== req.user._id.toString()) {
      throw ApiError.forbidden('Access denied');
    }
  }

  const q = await quotationService.createUpsell(req.params.id, req.body, req.user);
  new ApiResponse(201, { quotation: q }, 'Upsell quotation created').send(res);
});
