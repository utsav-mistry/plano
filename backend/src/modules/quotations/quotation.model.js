import mongoose from 'mongoose';
import { QUOTATION_STATUS } from '../../constants/statuses.js';

const lineItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discountValue: { type: Number, default: 0 },
    taxValue: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [lineItemSchema],
      validate: [(v) => v.length > 0, 'Quotation must have at least one item'],
    },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUS),
      default: QUOTATION_STATUS.DRAFT,
    },
    validUntil: { type: Date, required: true },
    notes: String,
    terms: String,
    pdfUrl: String,
    sentAt: Date,
    convertedToSubscription: { type: Boolean, default: false },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    closedAt: Date,
    closeReason: { type: String, trim: true, default: '' },
    isUpsell: { type: Boolean, default: false },
    upsellFromQuotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    upsellInitiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    negotiationState: {
      type: String,
      enum: ['none', 'pending_admin', 'pending_customer', 'resolved'],
      default: 'none',
    },
    negotiationHistory: {
      type: [
        {
          actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
          actorRole: { type: String, required: true },
          action: { type: String, enum: ['counter', 'accept', 'reject'], required: true },
          previousTotal: { type: Number, min: 0 },
          proposedTotal: { type: Number, min: 0 },
          note: { type: String, trim: true, default: '' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    acceptedAt: Date,
    rejectedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

quotationSchema.index({ status: 1, validUntil: 1 });
quotationSchema.index({ userId: 1, status: 1, negotiationState: 1 });

const Quotation = mongoose.model('Quotation', quotationSchema);
export default Quotation;
