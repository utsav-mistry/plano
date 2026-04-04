import User from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';

export const getAll = async ({ page = 1, limit = 20, role, isActive, search }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  return { users, total, page: +page, pages: Math.ceil(total / limit) };
};

export const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const update = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const deactivate = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const toggleStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = !user.isActive;
  await user.save();
  return user;
};
