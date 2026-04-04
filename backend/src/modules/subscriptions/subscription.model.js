import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../../constants/statuses.js';

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    trialEndsAt: Date,
    nextBillingDate: {
      type: Date,
      index: true, // Used by BullMQ renewal job
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    discountApplied: {
      type: Number,
      default: 0,
    },
    taxApplied: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    cancellationReason: String,
    cancelledAt: Date,
    pausedAt: Date,
    resumedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true, 
      versionKey: false,
      transform: (doc, ret) => { ret.id = ret._id; return ret; }
    },
    toObject: { virtuals: true }
  }
);

// Virtual: is currently in trial
subscriptionSchema.virtual('isInTrial').get(function () {
  return this.status === SUBSCRIPTION_STATUS.TRIAL && this.trialEndsAt > new Date();
});

subscriptionSchema.index({ status: 1, nextBillingDate: 1 });
subscriptionSchema.index({ userId: 1, status: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
