import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
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
  image?: string;
  parent?: mongoose.Types.ObjectId | null; // null = main category, has value = subcategory
  isActive: boolean;
  order: number; // For sorting
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
      fr: { type: String, required: true },
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
    image: {
      type: String, // Cloudinary URL
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Ensure virtuals are included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

export default mongoose.model<ICategory>('Category', categorySchema);