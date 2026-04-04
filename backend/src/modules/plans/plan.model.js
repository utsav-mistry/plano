import mongoose from 'mongoose';
import { BILLING_CYCLE } from '../../constants/statuses.js';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    billingCycle: {
      type: String,
      enum: Object.values(BILLING_CYCLE),
      required: [true, 'Billing cycle is required'],
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    trialDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    features: [String],
    maxUsers: {
      type: Number,
      default: null, // null = unlimited
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    discountIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discount' }],
    taxIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax' }],
    metadata: {
      type: Map,
      of: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

planSchema.index({ isActive: 1, billingCycle: 1 });
planSchema.index({ productId: 1 });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
