import mongoose from 'mongoose';
import { INVOICE_STATUS } from '../../constants/statuses.js';

const invoiceLineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    discountValue: { type: Number, default: 0 },
    taxValue: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [invoiceLineSchema],
      validate: [(v) => v.length > 0, 'Invoice must have at least one item'],
    },
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUS),
      default: INVOICE_STATUS.DRAFT,
    },
    dueDate: { type: Date, required: true },
    paidAt: Date,
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    pdfUrl: String,
    sentAt: Date,
    voidedAt: Date,
    voidReason: String,
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

invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ userId: 1, status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
