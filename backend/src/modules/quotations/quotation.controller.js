import * as quotationService from './quotation.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import catchAsync from '../../utils/catchAsync.js';

export const create = catchAsync(async (req, res) => {
  const q = await quotationService.create(req.body, req.user._id);
  new ApiResponse(201, { quotation: q }, 'Quotation created').send(res);
});

export const getAll = catchAsync(async (req, res) => {
  const result = await quotationService.getAll(req.query);
  new ApiResponse(200, result, 'Quotations fetched').send(res);
});

export const getById = catchAsync(async (req, res) => {
  const q = await quotationService.getById(req.params.id);
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
  const q = await quotationService.convert(req.params.id, req.user._id);
  new ApiResponse(200, { quotation: q }, 'Quotation converted to subscription').send(res);
});
