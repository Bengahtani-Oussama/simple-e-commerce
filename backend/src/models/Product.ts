import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// ATTRIBUTE VALUE INTERFACE
// ============================================
export interface IAttributeValue {
  code: string;
  label: {
    ar: string;
    en: string;
    fr: string;
  };
  value?: string; // For attributes like storage: "128GB"
  hexColor?: string; // For color attributes: "#000000"
  image?: string; // Optional image for the attribute value
}

// ============================================
// PRODUCT OPTION INTERFACE (Template)
// ============================================
export interface IProductOption {
  code: string; // e.g., "color", "size", "storage"
  label: {
    ar: string;
    en: string;
    fr: string;
  };
  type: 'select' | 'radio' | 'swatch'; // How to display in UI
  position: number; // Order of display
  required: boolean;
  values: IAttributeValue[]; // Available values for this option
}

// ============================================
// PRODUCT VARIANT INTERFACE
// ============================================
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string; // Unique identifier: "SHIRT-BLK-M-PLAIN"
  
  // Selected attribute values for this variant
  attributes: Map<string, IAttributeValue>;
  
  // Pricing
  pricing: {
    price: number;
    compareAtPrice?: number; // Original price for showing discounts
    cost?: number; // Cost price (for profit calculation)
  };
  
  // Inventory
  inventory: {
    stock: number;
    trackInventory: boolean;
    allowBackorder: boolean;
    lowStockThreshold?: number;
  };
  
  // Media
  images: string[]; // Variant-specific images
  
  // Physical properties
  physical?: {
    weight?: number; // in grams
    dimensions?: {
      length?: number; // in cm
      width?: number;
      height?: number;
    };
  };
  
  // Status
  status: 'active' | 'inactive' | 'out_of_stock';
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    urlKey?: string; // e.g., "black-medium-plain"
  };
}

// ============================================
// MAIN PRODUCT INTERFACE
// ============================================
export interface IProduct extends Document {
  // Product Type
  type: 'simple' | 'configurable'; // Simple = no variants, Configurable = has variants
  
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
  shortDescription?: {
    ar?: string;
    en?: string;
    fr?: string;
  };
  
  // Categorization
  category: mongoose.Types.ObjectId;
  subcategory?: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  
  // Product Options (for configurable products)
  options: IProductOption[]; // Available options like color, size, etc.
  
  // Variants (for configurable products)
  variants: IProductVariant[];
  
  // Base pricing (for simple products or fallback)
  basePricing: {
    price: number;
    compareAtPrice?: number;
    cost?: number;
  };
  
  // Base inventory (for simple products)
  baseInventory?: {
    stock: number;
    trackInventory: boolean;
    allowBackorder: boolean;
  };
  
  // Main product images (shown before variant selection)
  images: string[];
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  
  // Features & Specifications
  features?: {
    [key: string]: {
      ar: string;
      en: string;
      fr: string;
    };
  };
  
  specifications?: {
    [key: string]: string;
  };
  
  // Tags & Flags
  tags?: string[];
  isFeatured: boolean;
  isNewProduct: boolean;
  status: 'active' | 'inactive' | 'draft';
  
  // Stats
  stats: {
    soldCount: number;
    viewCount: number;
    reviewCount: number;
    averageRating: number;
  };
  
  // Related Products
  relatedProducts?: mongoose.Types.ObjectId[];
  upsellProducts?: mongoose.Types.ObjectId[];
  crossSellProducts?: mongoose.Types.ObjectId[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;

  findVariantByAttributes(attributes: { [key: string]: string }): IProductVariant | null;
  getAvailableOptions(optionCode: string, selectedAttributes?: { [key: string]: string }): IAttributeValue[];
}

// ============================================
// SCHEMAS
// ============================================

const attributeValueSchema = new Schema<IAttributeValue>({
  code: {
    type: String,
    required: true,
  },
  label: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, required: true },
  },
  value: String,
  hexColor: String,
  image: String,
}, { _id: false });

const productOptionSchema = new Schema<IProductOption>({
  code: {
    type: String,
    required: true,
  },
  label: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ['select', 'radio', 'swatch'],
    default: 'select',
  },
  position: {
    type: Number,
    default: 0,
  },
  required: {
    type: Boolean,
    default: true,
  },
  values: [attributeValueSchema],
}, { _id: false });

const variantSchema = new Schema<IProductVariant>({
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  attributes: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true,
  },
  pricing: {
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: Number,
    cost: Number,
  },
  inventory: {
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    allowBackorder: {
      type: Boolean,
      default: false,
    },
    lowStockThreshold: Number,
  },
  images: {
    type: [String],
    default: [],
  },
  physical: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    urlKey: String,
  },
});

const productSchema = new Schema<IProduct>(
  {
    type: {
      type: String,
      enum: ['simple', 'configurable'],
      default: 'configurable',
      required: true,
    },
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
    shortDescription: {
      ar: String,
      en: String,
      fr: String,
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
    options: {
      type: [productOptionSchema],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    basePricing: {
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      compareAtPrice: Number,
      cost: Number,
    },
    baseInventory: {
      stock: {
        type: Number,
        default: 0,
        min: 0,
      },
      trackInventory: {
        type: Boolean,
        default: true,
      },
      allowBackorder: {
        type: Boolean,
        default: false,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    features: {
      type: Map,
      of: {
        ar: String,
        en: String,
        fr: String,
      },
    },
    specifications: {
      type: Map,
      of: String,
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewProduct: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
      index: true,
    },
    stats: {
      soldCount: {
        type: Number,
        default: 0,
      },
      viewCount: {
        type: Number,
        default: 0,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
    },
    relatedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    upsellProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    crossSellProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product',
    }],
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================
productSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'name.fr': 'text' });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'stats.soldCount': -1 });
productSchema.index({ 'stats.averageRating': -1 });

// ============================================
// VALIDATION
// ============================================

// Ensure unique SKUs across all variants
productSchema.pre('save', function (next) {
  if (this.type === 'configurable' && this.variants.length > 0) {
    const skus = this.variants.map((v) => v.sku);
    const uniqueSkus = new Set(skus);
    
    if (skus.length !== uniqueSkus.size) {
      return next(new Error('Duplicate SKU found in variants'));
    }
  }
  
  next();
});

// Validate that configurable products have options and variants
productSchema.pre('save', function (next) {
  if (this.type === 'configurable') {
    if (this.options.length === 0) {
      return next(new Error('Configurable products must have at least one option'));
    }
    if (this.variants.length === 0) {
      return next(new Error('Configurable products must have at least one variant'));
    }
  }
  
  next();
});

// ============================================
// VIRTUALS
// ============================================

// Total stock across all variants
productSchema.virtual('totalStock').get(function () {
  if (this.type === 'simple') {
    return this.baseInventory?.stock || 0;
  }
  return this.variants.reduce((sum, variant) => sum + variant.inventory.stock, 0);
});

// Price range for configurable products
productSchema.virtual('priceRange').get(function () {
  if (this.type === 'simple') {
    return {
      min: this.basePricing.price,
      max: this.basePricing.price,
    };
  }
  
  const activePrices = this.variants
    .filter((v) => v.status === 'active')
    .map((v) => v.pricing.price);
  
  if (activePrices.length === 0) {
    return { min: this.basePricing.price, max: this.basePricing.price };
  }
  
  return {
    min: Math.min(...activePrices),
    max: Math.max(...activePrices),
  };
});

// Check if product is in stock
productSchema.virtual('isInStock').get(function () {
  if (this.type === 'simple') {
    return (this.baseInventory?.stock || 0) > 0;
  }
  return this.variants.some((v) => v.inventory.stock > 0 && v.status === 'active');
});

// Active variants count
productSchema.virtual('activeVariantsCount').get(function () {
  return this.variants.filter((v) => v.status === 'active').length;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// ============================================
// METHODS
// ============================================

// Find variant by attributes
productSchema.methods.findVariantByAttributes = function (
  attributes: { [key: string]: string }
): IProductVariant | null {
  return this.variants.find((variant: IProductVariant) => {
    return Object.entries(attributes).every(([key, value]) => {
      const variantAttr = variant.attributes.get(key);
      return variantAttr && variantAttr.code === value;
    });
  }) || null;
};

// Get available options for a specific option code
productSchema.methods.getAvailableOptions = function (
  optionCode: string,
  selectedAttributes: { [key: string]: string } = {}
): IAttributeValue[] {
  const option = this.options.find((opt: IProductOption) => opt.code === optionCode);
  if (!option) return [];
  
  // Filter based on already selected attributes
  const availableValues = option.values.filter((value: IAttributeValue) => {
    // Check if there's a variant with this value and the selected attributes
    return this.variants.some((variant: IProductVariant) => {
      const variantAttr = variant.attributes.get(optionCode);
      if (!variantAttr || variantAttr.code !== value.code) return false;
      
      // Check if variant matches all selected attributes
      return Object.entries(selectedAttributes).every(([key, val]) => {
        const attr = variant.attributes.get(key);
        return attr && attr.code === val;
      });
    });
  });
  
  return availableValues;
};

export default mongoose.model<IProduct>('Product', productSchema);