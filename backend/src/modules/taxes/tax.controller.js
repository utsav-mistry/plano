import * as taxService from './tax.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const create = catchAsync(async (req, res) => {
  const tax = await taxService.create(req.body, req.user._id);
  new ApiResponse(201, { tax }, 'Tax created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await taxService.getAll(req.query);
  new ApiResponse(200, result, 'Taxes fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const tax = await taxService.getById(req.params.id);
  new ApiResponse(200, { tax }, 'Tax fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const tax = await taxService.update(req.params.id, req.body);
  new ApiResponse(200, { tax }, 'Tax updated').send(res);
});

export const remove = catchAsync(async (req, res) => {
  await taxService.remove(req.params.id);
  new ApiResponse(200, null, 'Tax deactivated').send(res);
});
