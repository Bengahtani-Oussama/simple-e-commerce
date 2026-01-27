import mongoose, { Schema, Document } from 'mongoose';

export interface IProductPriority {
  product: mongoose.Types.ObjectId;
  position: number; // 0-based ordering
  isPinned: boolean; // Pin to top of section
  isFeatured: boolean; // Special highlighting
  customNote?: string; // Optional admin note
}

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
  products: mongoose.Types.ObjectId[]; // References to Product model (deprecated - use productPriorities)
  
  // ✨ NEW: Product Priority System
  productPriorities: IProductPriority[];
  
  isActive: boolean;
  order: number; // For sorting sections on frontend
  minProducts: number; // Minimum required products (default: 5)

  // ✨ NEW: Product Priority System
  pinnedProducts: mongoose.Types.ObjectId[];
  featuredProducts: mongoose.Types.ObjectId[];
  
  // Scheduling Features
  scheduling: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    autoArchive: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;

  togglePin: (productId: string) => Promise<void>;
  toggleFeature: (productId: mongoose.Types.ObjectId) => Promise<void>;
  rebuildPositionMap: () => void;
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
      index: true,
    },
    productPriorities: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          position: {
            type: Number,
            required: true,
          },
          isPinned: {
            type: Boolean,
            default: false,
          },
          isFeatured: {
            type: Boolean,
            default: false,
          },
          customNote: {
            type: String,
          },
        },
      ],
      default: [],
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

    // Metadata arrays
    pinnedProducts: [String],
    featuredProducts: [String],

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
    scheduling: {
      enabled: {
        type: Boolean,
        default: false,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      autoArchive: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Ensure minimum product count
sectionSchema.pre('save', function (next) {
  // Support both old (products array) and new (productPriorities) formats
  const productCount = this.productPriorities.length > 0 
    ? this.productPriorities.length 
    : this.products.length;
  
  if (productCount < this.minProducts) {
    return next(
      new Error(
        `Section must have at least ${this.minProducts} products`
      )
    );
  }
  
  // Validate scheduling dates
  if (this.scheduling.enabled && this.scheduling.startDate && this.scheduling.endDate) {
    if (this.scheduling.endDate <= this.scheduling.startDate) {
      return next(new Error('End date must be after start date'));
    }
  }
  
  // Auto-migrate from old format to new format
  if (this.products.length > 0 && this.productPriorities.length === 0) {
    this.productPriorities = this.products.map((productId, index) => ({
      product: productId,
      position: index,
      isPinned: false,
      isFeatured: false,
    }));
  }
  
  next();
});

// Virtual to get active product count
sectionSchema.virtual('activeProductCount').get(function () {
  return this.productPriorities.length > 0 
    ? this.productPriorities.length 
    : this.products.length;
});

// Virtual to check if section is currently scheduled to be active
sectionSchema.virtual('isScheduledActive').get(function () {
  if (!this.scheduling.enabled) return this.isActive;
  
  const now = new Date();
  const hasStarted = !this.scheduling.startDate || now >= this.scheduling.startDate;
  const hasNotEnded = !this.scheduling.endDate || now < this.scheduling.endDate;
  
  return hasStarted && hasNotEnded && this.isActive;
});

// Virtual to get ordered products (sorted by position, pinned first)
sectionSchema.virtual('orderedProducts').get(function () {
  return this.productPriorities
    .sort((a, b) => {
      // Pinned products first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by position
      return a.position - b.position;
    });
});

// Toggle pin status
sectionSchema.methods.togglePin = function(id: string): boolean {
  if (!this.products.includes(id)) return false;
  
  const index = this.pinnedProducts.indexOf(id);
  
  if (index === -1) {
    // Add
    this.pinnedProducts.push(id);
    
    // update productPriorities
    this.productPriorities.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === id as any) {
        productPriority.isPinned = true;
      }
    });

    // update orderedProducts
    this.orderedProducts.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === id as any) {
        productPriority.isPinned = true;
      }
    });
  } else {
    // Remove
    this.pinnedProducts.splice(index, 1);

    // update productPriorities
    this.productPriorities.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === id as any) {
        productPriority.isPinned = false;
      }
    });

    // update orderedProducts
    this.orderedProducts.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === id as any) {
        productPriority.isPinned = false;
      }
    });
  }
  
  return true;
};

// Remove product
sectionSchema.methods.removeProduct = function(productId: string): boolean {
  const index = this.products.indexOf(productId);
  if (index === -1) return false;
  
  this.products.splice(index, 1);
  this.pinnedProducts = this.pinnedProducts.filter((id: string) => id !== productId);
  this.featuredProducts = this.featuredProducts.filter((id: string) => id !== productId);
  
  this.rebuildPositionMap();
  return true;
};

// Toggle feature status
sectionSchema.methods.toggleFeature = function(productId: string): boolean {
  if (!this.products.includes(productId)) return false;
  
  const index = this.featuredProducts.indexOf(productId);
  if (index === -1) {
    // Add
    this.featuredProducts.push(productId);
    // update productPriorities
    this.productPriorities.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === productId as any) {
        productPriority.isFeatured = true;
      }
    });

    // update orderedProducts
    this.orderedProducts.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === productId as any) {
        productPriority.isFeatured = true;
      }
    });
  } else {
    // Remove
    this.featuredProducts.splice(index, 1);

    // update productPriorities
    this.productPriorities.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === productId as any) {
        productPriority.isFeatured = false;
      }
    });

    // update orderedProducts
    this.orderedProducts.forEach((productPriority: IProductPriority) => {
      if (productPriority.product.toString() === productId as any) {
        productPriority.isFeatured = false;
      }
    });
  }
  
  return true;
};

// Rebuild position map from array
sectionSchema.methods.rebuildPositionMap = function(): void {
  this.productPositions = new Map();
  this.products.forEach((id: string, index: number) => {
    this.productPositions.set(id, index);
  });
};

sectionSchema.set('toJSON', { virtuals: true });
sectionSchema.set('toObject', { virtuals: true });

export default mongoose.model<ISection>('Section', sectionSchema);