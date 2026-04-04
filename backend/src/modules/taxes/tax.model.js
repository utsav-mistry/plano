import mongoose from 'mongoose';

const taxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tax name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Tax code is required'],
      uppercase: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
    },
    type: {
      type: String,
      enum: ['inclusive', 'exclusive'],
      default: 'exclusive',
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
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

taxSchema.index({ code: 1, country: 1 });

const Tax = mongoose.model('Tax', taxSchema);
export default Tax;
