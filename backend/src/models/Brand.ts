import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string; // Cloudinary URL
  description?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    logo: {
      type: String, // Cloudinary URL
    },
    description: {
      ar: String,
      en: String,
      fr: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });

export default mongoose.model<IBrand>('Brand', brandSchema);