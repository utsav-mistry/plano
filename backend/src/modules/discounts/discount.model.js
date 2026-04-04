import mongoose from 'mongoose';
import { DISCOUNT_TYPE } from '../../constants/statuses.js';

const discountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      required: [true, 'Discount code is required'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(DISCOUNT_TYPE),
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },
    maxUsage: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableTo: {
      type: String,
      enum: ['all', 'plan', 'product'],
      default: 'all',
    },
    applicableIds: [mongoose.Schema.Types.ObjectId],
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

discountSchema.index({ code: 1, isActive: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });

// Check if discount is currently valid
discountSchema.methods.isValid = function (orderAmount = 0) {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.validFrom || now > this.validUntil) return false;
  if (this.maxUsage && this.usedCount >= this.maxUsage) return false;
  if (orderAmount < this.minOrderAmount) return false;
  return true;
};

const Discount = mongoose.model('Discount', discountSchema);
export default Discount;
