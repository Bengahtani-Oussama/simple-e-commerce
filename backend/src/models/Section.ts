import mongoose, { Schema, Document } from 'mongoose';

// ===================================
// NEW APPROACH: Simplified Data Model
// ===================================

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
  
  // ✨ NEW: Simple product array with explicit ordering
  productIds: string[];  // Ordered array of product IDs
  
  // ✨ NEW: Separate metadata for cleaner queries
  pinnedProducts: string[];  // Product IDs that are pinned
  featuredProducts: string[];  // Product IDs that are featured
  
  // ✨ NEW: Position map for quick lookups (denormalized)
  productPositions: Map<string, number>;  // { productId: position }
  
  isActive: boolean;
  order: number;
  minProducts: number;
  
  scheduling: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    autoArchive: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastCleanup?: Date;

  rebuildPositionMap: () => void;
  removeProduct(productId: string): boolean;
  moveProduct(productId: string, newPosition: number): boolean;
  addProduct(productId: string, position?: number): void;
  getOrderedProducts(): { productId: string; position: number; isPinned: boolean; isFeatured: boolean }[];
  togglePin(productId: string): boolean;
  toggleFeature(productId: string): boolean;
}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
      fr: { type: String, required: true, trim: true },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      ar: String,
      en: String,
      fr: String,
    },
    
    // Simple ordered array
    productIds: [{
      type: String,
      required: true,
    }],
    
    // Metadata arrays
    pinnedProducts: [String],
    featuredProducts: [String],
    
    // Position map stored as object in MongoDB
    productPositions: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    minProducts: {
      type: Number,
      default: 5,
      min: 1,
    },
    scheduling: {
      enabled: { type: Boolean, default: false },
      startDate: Date,
      endDate: Date,
      autoArchive: { type: Boolean, default: false },
    },
    lastCleanup: Date,
  },
  {
    timestamps: true,
  }
);

// ===================================
// INDEXES
// ===================================
sectionSchema.index({ 'scheduling.startDate': 1, 'scheduling.endDate': 1 });

// ===================================
// INSTANCE METHODS
// ===================================

// Add product at specific position
sectionSchema.methods.addProduct = function(
  productId: string, 
  position?: number
): void {
  // Remove if exists
  this.productIds = this.productIds.filter((id: string) => id !== productId);
  
  // Add at position
  if (position !== undefined && position >= 0 && position <= this.productIds.length) {
    this.productIds.splice(position, 0, productId);
  } else {
    this.productIds.push(productId);
  }
  
  // Rebuild position map
  this.rebuildPositionMap();
};

// Remove product
sectionSchema.methods.removeProduct = function(productId: string): boolean {
  const index = this.productIds.indexOf(productId);
  if (index === -1) return false;
  
  this.productIds.splice(index, 1);
  this.pinnedProducts = this.pinnedProducts.filter((id: string) => id !== productId);
  this.featuredProducts = this.featuredProducts.filter((id: string) => id !== productId);
  
  this.rebuildPositionMap();
  return true;
};

// Move product to new position
sectionSchema.methods.moveProduct = function(
  productId: string, 
  newPosition: number
): boolean {
  const oldIndex = this.productIds.indexOf(productId);
  if (oldIndex === -1) return false;
  
  // Remove from old position
  this.productIds.splice(oldIndex, 1);
  
  // Insert at new position
  this.productIds.splice(newPosition, 0, productId);
  
  this.rebuildPositionMap();
  return true;
};

// Toggle pin status
sectionSchema.methods.togglePin = function(productId: string): boolean {
  if (!this.productIds.includes(productId)) return false;
  
  const index = this.pinnedProducts.indexOf(productId);
  if (index === -1) {
    this.pinnedProducts.push(productId);
  } else {
    this.pinnedProducts.splice(index, 1);
  }
  
  return true;
};

// Toggle feature status
sectionSchema.methods.toggleFeature = function(productId: string): boolean {
  if (!this.productIds.includes(productId)) return false;
  
  const index = this.featuredProducts.indexOf(productId);
  if (index === -1) {
    this.featuredProducts.push(productId);
  } else {
    this.featuredProducts.splice(index, 1);
  }
  
  return true;
};

// Rebuild position map from array
sectionSchema.methods.rebuildPositionMap = function(): void {
  this.productPositions = new Map();
  this.productIds.forEach((id: string, index: number) => {
    this.productPositions.set(id, index);
  });
};

// Get ordered products with metadata
sectionSchema.methods.getOrderedProducts = function() {
  return this.productIds.map((id: string, index: number) => ({
    productId: id,
    position: index,
    isPinned: this.pinnedProducts.includes(id),
    isFeatured: this.featuredProducts.includes(id),
  }));
};

// ===================================
// PRE-SAVE HOOKS
// ===================================
sectionSchema.pre('save', function(next) {
  // Validate minimum products
  if (this.productIds.length < this.minProducts) {
    return next(
      new Error(`Section must have at least ${this.minProducts} products`)
    );
  }
  
  // Validate scheduling dates
  if (
    this.scheduling.enabled &&
    this.scheduling.startDate &&
    this.scheduling.endDate
  ) {
    if (this.scheduling.endDate <= this.scheduling.startDate) {
      return next(new Error('End date must be after start date'));
    }
  }
  
  // Ensure position map is up to date
  this.rebuildPositionMap();
  
  next();
});

// ===================================
// VIRTUALS
// ===================================
sectionSchema.virtual('activeProductCount').get(function() {
  return this.productIds.length;
});

sectionSchema.virtual('isScheduledActive').get(function() {
  if (!this.scheduling.enabled) return this.isActive;
  
  const now = new Date();
  const hasStarted = !this.scheduling.startDate || now >= this.scheduling.startDate;
  const hasNotEnded = !this.scheduling.endDate || now < this.scheduling.endDate;
  
  return hasStarted && hasNotEnded && this.isActive;
});

sectionSchema.set('toJSON', { virtuals: true });
sectionSchema.set('toObject', { virtuals: true });

export default mongoose.model<ISection>('Section', sectionSchema);