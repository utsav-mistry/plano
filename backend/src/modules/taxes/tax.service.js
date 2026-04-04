import Tax from './tax.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const create = async (data, createdBy) => Tax.create({ ...data, createdBy });

export const getAll = async ({ page = 1, limit = 50, country, isActive }) => {
  const filter = {};
  if (country) filter.country = country;
  if (isActive !== undefined) filter.isActive = isActive !== 'false';
  const skip = (page - 1) * limit;
  const [taxes, total] = await Promise.all([
    Tax.find(filter).skip(skip).limit(+limit).sort({ country: 1, name: 1 }),
    Tax.countDocuments(filter),
  ]);
  return { taxes, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const tax = await Tax.findById(id);
  if (!tax) throw ApiError.notFound('Tax not found');
  return tax;
};

export const update = async (id, data) => {
  const tax = await Tax.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!tax) throw ApiError.notFound('Tax not found');
  return tax;
};

export const remove = async (id) => {
  const tax = await Tax.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!tax) throw ApiError.notFound('Tax not found');
  return tax;
};
