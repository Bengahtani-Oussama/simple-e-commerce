// backend/src/models/Coupon.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string; // Unique coupon code (e.g., SUMMER2024)
  type: 'percentage' | 'fixed' | 'free_shipping';
  
  // Discount values
  discountPercentage?: number; // For percentage type (e.g., 20 = 20%)
  discountAmount?: number; // For fixed type (e.g., 500 = 500 DA)
  
  // Usage restrictions
  minOrderValue?: number; // Minimum order value to apply coupon
  maxDiscount?: number; // Maximum discount amount (for percentage type)
  usageLimit?: number; // Total times coupon can be used (null = unlimited)
  usagePerCustomer?: number; // Times each customer can use it (default: 1)
  usedCount: number; // Current usage count
  
  // Validity
  startDate?: Date; // When coupon becomes active
  endDate?: Date; // When coupon expires
  isActive: boolean;
  
  // Metadata
  description?: string;
  createdBy?: mongoose.Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;

  calculateDiscount: (orderSubtotal: number, shippingCost: number) => { discount: number; freeShipping: boolean };
  validateForOrder: (orderSubtotal: number, customerId: string, customerUsageCount: number) => { valid: boolean; reason?: string };
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [50, 'Coupon code must be less than 50 characters'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Coupon type is required'],
      enum: ['percentage', 'fixed', 'free_shipping'],
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
      validate: {
        validator: function (this: ICoupon, value: number) {
          return this.type !== 'percentage' || (value !== undefined && value > 0);
        },
        message: 'Discount percentage is required for percentage type coupons',
      },
    },
    discountAmount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative'],
      validate: {
        validator: function (this: ICoupon, value: number) {
          return this.type !== 'fixed' || (value !== undefined && value > 0);
        },
        message: 'Discount amount is required for fixed type coupons',
      },
    },
    minOrderValue: {
      type: Number,
      min: [0, 'Minimum order value cannot be negative'],
      default: 0,
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Maximum discount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      min: [1, 'Usage limit must be at least 1'],
      default: null, // null means unlimited
    },
    usagePerCustomer: {
      type: Number,
      min: [1, 'Usage per customer must be at least 1'],
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: ICoupon, value: Date) {
          return !this.startDate || !value || value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual to check if coupon is currently valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) return false;
  
  // Check start date
  if (this.startDate && now < this.startDate) return false;
  
  // Check end date
  if (this.endDate && now > this.endDate) return false;
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
});

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (
  orderSubtotal: number,
  shippingCost: number
): { discount: number; freeShipping: boolean } {
  let discount = 0;
  let freeShipping = false;

  if (this.type === 'percentage') {
    discount = (orderSubtotal * this.discountPercentage) / 100;
    
    // Apply max discount cap if set
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === 'fixed') {
    discount = Math.min(this.discountAmount, orderSubtotal);
  } else if (this.type === 'free_shipping') {
    freeShipping = true;
    discount = shippingCost;
  }

  return {
    discount: Math.round(discount * 100) / 100, // Round to 2 decimals
    freeShipping,
  };
};

// Method to validate coupon for a specific order
couponSchema.methods.validateForOrder = function (
  orderSubtotal: number,
  customerId: string,
  customerUsageCount: number = 0
): { valid: boolean; reason?: string } {
  // Check if coupon is valid
  if (!this.isValid) {
    if (!this.isActive) {
      return { valid: false, reason: 'Coupon is inactive' };
    }
    
    const now = new Date();
    if (this.startDate && now < this.startDate) {
      return { valid: false, reason: 'Coupon is not yet active' };
    }
    
    if (this.endDate && now > this.endDate) {
      return { valid: false, reason: 'Coupon has expired' };
    }
    
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
      return { valid: false, reason: 'Coupon usage limit reached' };
    }
  }

  // Check minimum order value
  if (this.minOrderValue && orderSubtotal < this.minOrderValue) {
    return {
      valid: false,
      reason: `Minimum order value of ${this.minOrderValue} DA required`,
    };
  }

  // Check customer usage limit
  if (customerUsageCount >= this.usagePerCustomer) {
    return {
      valid: false,
      reason: `You have already used this coupon ${this.usagePerCustomer} time(s)`,
    };
  }

  return { valid: true };
};

couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICoupon>('Coupon', couponSchema);