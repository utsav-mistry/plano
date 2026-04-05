import Product from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';

const normalizeSku = (value) => String(value || '').trim().toUpperCase();

const withSkuConflictHandling = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.sku) {
    throw ApiError.conflict('SKU already exists. Please use a unique SKU.');
  }
  throw error;
};

export const create = async (data) => {
  const payload = { ...data };
  if (payload.sku !== undefined) {
    payload.sku = normalizeSku(payload.sku);
  }

  if (payload.sku) {
    const existing = await Product.findOne({ sku: payload.sku }).select('_id');
    if (existing) {
      throw ApiError.conflict('SKU already exists. Please use a unique SKU.');
    }
  }

  try {
    return await Product.create(payload);
  } catch (error) {
    withSkuConflictHandling(error);
  }
};

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
  const patch = { ...data };
  if (patch.sku !== undefined) {
    patch.sku = normalizeSku(patch.sku);
    if (patch.sku) {
      const existing = await Product.findOne({ sku: patch.sku, _id: { $ne: id } }).select('_id');
      if (existing) {
        throw ApiError.conflict('SKU already exists. Please use a unique SKU.');
      }
    }
  }

  try {
    const product = await Product.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  } catch (error) {
    withSkuConflictHandling(error);
  }
};

export const remove = async (id) => {
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};
