import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  slug: string;
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  products: mongoose.Types.ObjectId[]; // References to Product model
  isActive: boolean;
  order: number; // For sorting sections on frontend
  minProducts: number; // Minimum required products (default: 5)
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      ar: {
        type: String,
        required: [true, 'Arabic name is required'],
        trim: true,
      },
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
      },
      fr: {
        type: String,
        required: [true, 'French name is required'],
        trim: true,
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      ar: String,
      en: String,
      fr: String,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    minProducts: {
      type: Number,
      default: 5,
      min: [1, 'Minimum products must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
sectionSchema.index({ slug: 1 });
sectionSchema.index({ isActive: 1 });
sectionSchema.index({ order: 1 });

// Validation: Ensure minimum product count
sectionSchema.pre('save', function (next) {
  if (this.products.length < this.minProducts) {
    return next(
      new Error(
        `Section must have at least ${this.minProducts} products`
      )
    );
  }
  next();
});

// Virtual to get active product count
sectionSchema.virtual('activeProductCount').get(function () {
  return this.products.length;
});

sectionSchema.set('toJSON', { virtuals: true });
sectionSchema.set('toObject', { virtuals: true });

export default mongoose.model<ISection>('Section', sectionSchema);