import * as discountService from './discount.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const create = catchAsync(async (req, res) => {
  const d = await discountService.create(req.body, req.user._id);
  new ApiResponse(201, { discount: d }, 'Discount created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await discountService.getAll(req.query);
  new ApiResponse(200, result, 'Discounts fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const d = await discountService.getById(req.params.id);
  new ApiResponse(200, { discount: d }, 'Discount fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const d = await discountService.update(req.params.id, req.body);
  new ApiResponse(200, { discount: d }, 'Discount updated').send(res);
});

export const toggle = catchAsync(async (req, res) => {
  const d = await discountService.toggle(req.params.id);
  new ApiResponse(200, { discount: d }, 'Discount status toggled').send(res);
});

export const remove = catchAsync(async (req, res) => {
  await discountService.remove(req.params.id);
  new ApiResponse(200, null, 'Discount deactivated').send(res);
});

export const validateCode = catchAsync(async (req, res) => {
  const discount = await discountService.validate(req.body);
  new ApiResponse(200, { discount }, 'Discount code is valid').send(res);
});
