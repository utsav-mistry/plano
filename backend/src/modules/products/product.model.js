import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['software', 'service', 'addon'],
      required: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    unitLabel: {
      type: String,
      default: 'unit', // e.g., "seat", "GB", "API call"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    taxApplicable: {
      type: Boolean,
      default: false,
    },
    taxIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tax' }],
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

productSchema.index({ isActive: 1, type: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
