import Plan from './plan.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const create = async (data) => Plan.create(data);

export const getAll = async ({ page = 1, limit = 20, billingCycle, isActive, productId }) => {
  const filter = {};
  if (billingCycle) filter.billingCycle = billingCycle;
  if (isActive !== undefined) filter.isActive = isActive !== 'false';
  if (productId) filter.productId = productId;
  const skip = (page - 1) * limit;
  const [plans, total] = await Promise.all([
    Plan.find(filter).populate('productId', 'name type').populate('taxIds discountIds').skip(skip).limit(+limit).sort({ price: 1 }),
    Plan.countDocuments(filter),
  ]);
  return { plans, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const plan = await Plan.findById(id).populate('productId taxIds discountIds');
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
};

export const update = async (id, data) => {
  const plan = await Plan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
};

export const remove = async (id) => {
  const plan = await Plan.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!plan) throw ApiError.notFound('Plan not found');
  return plan;
};
