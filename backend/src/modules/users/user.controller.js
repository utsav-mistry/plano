import * as userService from './user.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const getAll = catchAsync(async (req, res) => {
  const result = await userService.getAll(req.query);
  new ApiResponse(200, result, 'Users fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  new ApiResponse(200, { user }, 'User fetched').send(res);
});

export const update = catchAsync(async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  new ApiResponse(200, { user }, 'User updated').send(res);
});

export const remove = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  new ApiResponse(200, null, 'User deleted').send(res);
});

export const toggleStatus = catchAsync(async (req, res) => {
  const user = await userService.toggleStatus(req.params.id);
  new ApiResponse(200, { user }, 'User status toggled').send(res);
});
