import mongoose, { Schema, Document } from "mongoose";

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

  // Scheduling Features
  scheduling: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    autoArchive: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<ISection>(
  {
    name: {
      ar: {
        type: String,
        required: [true, "Arabic name is required"],
        trim: true,
      },
      en: {
        type: String,
        required: [true, "English name is required"],
        trim: true,
      },
      fr: {
        type: String,
        required: [true, "French name is required"],
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
        ref: "Product",
      },
    ],
    productPriorities: {
      type: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          position: {
            type: Number,
            default: 0,
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
      default: [], // 🔑 CRITICAL
    },
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
      min: [1, "Minimum products must be at least 1"],
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
  },
);

// Indexes for performance
sectionSchema.index({ slug: 1 });
sectionSchema.index({ isActive: 1 });
sectionSchema.index({ order: 1 });

// Validation: Ensure minimum product count
sectionSchema.pre("save", function (next) {
  // Support both old (products array) and new (productPriorities) formats
  const productCount =
    this.productPriorities.length > 0
      ? this.productPriorities.length
      : this.products.length;

  if (productCount < this.minProducts) {
    return next(
      new Error(`Section must have at least ${this.minProducts} products`),
    );
  }

  // Validate scheduling dates
  if (
    this.scheduling.enabled &&
    this.scheduling.startDate &&
    this.scheduling.endDate
  ) {
    if (this.scheduling.endDate <= this.scheduling.startDate) {
      return next(new Error("End date must be after start date"));
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
sectionSchema.virtual("activeProductCount").get(function () {
  return this.productPriorities.length > 0
    ? this.productPriorities.length
    : this.products.length;
});

// Virtual to check if section is currently scheduled to be active
sectionSchema.virtual("isScheduledActive").get(function () {
  if (!this.scheduling.enabled) return this.isActive;

  const now = new Date();
  const hasStarted =
    !this.scheduling.startDate || now >= this.scheduling.startDate;
  const hasNotEnded = !this.scheduling.endDate || now < this.scheduling.endDate;

  return hasStarted && hasNotEnded && this.isActive;
});

// Virtual to get ordered products (sorted by position, pinned first)
sectionSchema.virtual("orderedProducts").get(function () {
  return this.productPriorities.sort((a, b) => {
    // Pinned products first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Then by position
    return a.position - b.position;
  });
});

sectionSchema.set("toJSON", { virtuals: true });
sectionSchema.set("toObject", { virtuals: true });

export default mongoose.model<ISection>("Section", sectionSchema);
