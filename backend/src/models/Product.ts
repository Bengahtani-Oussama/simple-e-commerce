import mongoose, { Schema, Document } from 'mongoose';

// Product Variant Interface
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string; // Unique identifier for this variant
  
  // Variant attributes
  size?: string;
  color?: string;
  material?: string;
  customOptions?: { [key: string]: string }; // e.g., { "Neck Style": "V-Neck", "Sleeve": "Long" }
  
  // Pricing & Stock
  price?: number; // If not set, uses product basePrice
  compareAtPrice?: number; // Original price for discounts
  stock: number;
  
  // Media
  images: string[]; // Cloudinary URLs
  
  // Status
  isActive: boolean;
}

export interface IProduct extends Document {
  // Basic Info
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  slug: string;
  description: {
    ar: string;
    en: string;
    fr: string;
  };
  
  // Categorization
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  
  // Pricing
  basePrice: number; // Base price in DA
  compareAtPrice?: number; // For showing discounts
  
  // Variants - THE COMPLEX PART
  variants: IProductVariant[];
  
  // Available variant options (for filtering)
  variantOptions: {
    sizes?: string[]; // e.g., ["S", "M", "L", "XL"]
    colors?: string[]; // e.g., ["Red", "Blue", "Green"]
    materials?: string[]; // e.g., ["Cotton", "Polyester", "Blend"]
    customFields?: { name: string; values: string[] }[]; // e.g., [{ name: "Neck Style", values: ["V-Neck", "Round"] }]
  };
  
  // Main product images (used when no variant is selected)
  images: string[];
  
  // SEO & Details
  tags?: string[];
  featured: boolean;
  isActive: boolean;
  
  // Stats
  soldCount: number;
  viewCount: number;
  
  // Shipping
  weight?: number; // in grams
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>({
  sku: {
    type: String,
    required: true,
  },
  size: String,
  color: String,
  material: String,
  customOptions: {
    type: Object,
    default: {},
  },
  price: Number,
  compareAtPrice: Number,
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const productSchema = new Schema<IProduct>(
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
      index: true,
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
      fr: { type: String, required: true },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    variantOptions: {
      sizes: [String],
      colors: [String],
      materials: [String],
      customFields: [
        {
          name: String,
          values: [String],
        },
      ],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: [String],
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
productSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'name.fr': 'text' });

// Ensure unique SKUs across all variants
productSchema.pre('save', function (next) {
  const skus = this.variants.map((v) => v.sku);
  const uniqueSkus = new Set(skus);
  
  if (skus.length !== uniqueSkus.size) {
    return next(new Error('Duplicate SKU found in variants'));
  }
  
  next();
});

// Virtual for total stock
productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, variant) => sum + variant.stock, 0);
});

// Virtual for price range
productSchema.virtual('priceRange').get(function () {
  if (this.variants.length === 0) {
    return { min: this.basePrice, max: this.basePrice };
  }
  
  const prices = this.variants
    .filter((v) => v.isActive)
    .map((v) => v.price || this.basePrice);
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model<IProduct>('Product', productSchema);