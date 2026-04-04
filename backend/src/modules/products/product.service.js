import Product from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const create = async (data) => Product.create(data);

export const getAll = async ({ page = 1, limit = 20, type, isActive, search }) => {
  const filter = {};
  if (type) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive !== 'false';
  if (search) filter.name = { $regex: search, $options: 'i' };
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter).populate('taxIds', 'name rate').skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Product.countDocuments(filter),
  ]);
  return { products, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const product = await Product.findById(id).populate('taxIds');
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const update = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const remove = async (id) => {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};
