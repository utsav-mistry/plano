import * as planService from './plan.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const create = catchAsync(async (req, res) => {
  const plan = await planService.create({ ...req.body, createdBy: req.user._id });
  new ApiResponse(201, { plan }, 'Plan created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await planService.getAll(req.query);
  new ApiResponse(200, result, 'Plans fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const plan = await planService.getById(req.params.id);
  new ApiResponse(200, { plan }, 'Plan fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const plan = await planService.update(req.params.id, req.body);
  new ApiResponse(200, { plan }, 'Plan updated').send(res);
});

export const remove = catchAsync(async (req, res) => {
  await planService.remove(req.params.id);
  new ApiResponse(200, null, 'Plan deactivated').send(res);
});
