import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_GATEWAY, PAYMENT_METHOD } from '../../constants/statuses.js';

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    gateway: {
      type: String,
      enum: Object.values(PAYMENT_GATEWAY),
      required: true,
    },
    gatewayTransactionId: {
      type: String,
      index: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      select: false, // Sensitive — not returned by default
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: String,
    refundedAt: Date,
    processedAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
