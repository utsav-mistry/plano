import * as invoiceService from './invoice.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import catchAsync from '../../utils/catchAsync.js';
import { ROLES } from '../../constants/roles.js';

export const create = catchAsync(async (req, res) => {
  const invoice = await invoiceService.create(req.body, req.user._id);
  new ApiResponse(201, { invoice }, 'Invoice created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  if (req.user.role === ROLES.PORTAL_USER) req.query.userId = req.user._id;
  const result = await invoiceService.getAll(req.query);
  new ApiResponse(200, result, 'Invoices fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getById(req.params.id);
  if (req.user.role === ROLES.PORTAL_USER && invoice.userId._id.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Access denied');
  }
  new ApiResponse(200, { invoice }, 'Invoice fetched').send(res);
});

export const send = catchAsync(async (req, res) => {
  const invoice = await invoiceService.markSent(req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice marked as sent').send(res);
});

export const voidInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.voidInvoice(req.params.id, req.body.reason);
  new ApiResponse(200, { invoice }, 'Invoice voided').send(res);
});
