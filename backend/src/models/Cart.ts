import mongoose, { Schema, Document } from 'mongoose';

// ============================================
// CART ITEM INTERFACE
// ============================================
export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId; // Reference to specific variant
  sku: string;
  
  // Product name (for quick display)
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  
  // Selected attributes for this variant
  selectedAttributes: {
    [optionCode: string]: {
      code: string;
      label: {
        ar: string;
        en: string;
        fr: string;
      };
      value?: string; // For attributes like storage: "128GB"
      hexColor?: string; // For color attributes
    };
  };
  
  // Pricing (snapshot at time of adding to cart)
  pricing: {
    price: number;
    compareAtPrice?: number;
  };
  
  // Quantity
  quantity: number;
  
  // Media
  image?: string; // Main variant image
  
  // Availability (checked at cart load)
  availability: {
    inStock: boolean;
    currentStock: number;
    allowBackorder: boolean;
  };
  
  // Product type for validation
  productType: 'simple' | 'configurable';
}

// ============================================
// CART INTERFACE
// ============================================
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  
  // Pricing summary
  summary: {
    subtotal: number;
    itemCount: number;
  };
  
  // Cart metadata
  lastActivity: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SCHEMAS
// ============================================

const cartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, required: true },
  },
  selectedAttributes: {
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
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  image: String,
  availability: {
    inStock: {
      type: Boolean,
      default: true,
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    allowBackorder: {
      type: Boolean,
      default: false,
    },
  },
  productType: {
    type: String,
    enum: ['simple', 'configurable'],
    required: true,
  },
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    summary: {
      subtotal: {
        type: Number,
        default: 0,
        min: 0,
      },
      itemCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// MIDDLEWARE
// ============================================

// Update summary before saving
cartSchema.pre('save', function (next) {
  this.summary.subtotal = this.items.reduce(
    (sum, item) => sum + item.pricing.price * item.quantity,
    0
  );
  
  this.summary.itemCount = this.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  
  this.lastActivity = new Date();
  
  next();
});

// ============================================
// INDEXES
// ============================================
cartSchema.index({ lastActivity: 1 }); // For cleanup of abandoned carts
cartSchema.index({ 'items.sku': 1 });

// ============================================
// VIRTUALS
// ============================================

// Check if cart has any out-of-stock items
cartSchema.virtual('hasOutOfStockItems').get(function () {
  return this.items.some(item => !item.availability.inStock && !item.availability.allowBackorder);
});

// Get total savings (compareAt - price)
cartSchema.virtual('totalSavings').get(function () {
  return this.items.reduce((savings, item) => {
    if (item.pricing.compareAtPrice) {
      const itemSavings = (item.pricing.compareAtPrice - item.pricing.price) * item.quantity;
      return savings + itemSavings;
    }
    return savings;
  }, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICart>('Cart', cartSchema);