import Discount from './discount.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const create = async (data, createdBy) => Discount.create({ ...data, createdBy });

export const getAll = async ({ page = 1, limit = 20, isActive }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive !== 'false';
  const skip = (page - 1) * limit;
  const [discounts, total] = await Promise.all([
    Discount.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Discount.countDocuments(filter),
  ]);
  return { discounts, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const d = await Discount.findById(id);
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const update = async (id, data) => {
  const d = await Discount.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const remove = async (id) => {
  const d = await Discount.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!d) throw ApiError.notFound('Discount not found');
  return d;
};

export const validate = async (code, orderAmount = 0) => {
  const discount = await Discount.findOne({ code: code.toUpperCase() });
  if (!discount) throw ApiError.notFound('Discount code not found');
  if (!discount.isValid(orderAmount)) throw ApiError.badRequest('Discount code is invalid, expired, or not applicable');
  return discount;
};
