import * as productService from './product.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const create = catchAsync(async (req, res) => {
  const product = await productService.create({ ...req.body, createdBy: req.user._id });
  new ApiResponse(201, { product }, 'Product created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await productService.getAll(req.query);
  new ApiResponse(200, result, 'Products fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const product = await productService.getById(req.params.id);
  new ApiResponse(200, { product }, 'Product fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  new ApiResponse(200, { product }, 'Product updated').send(res);
});

export const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id);
  new ApiResponse(200, null, 'Product deactivated').send(res);
});
