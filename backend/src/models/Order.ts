import mongoose, { Schema, Document } from "mongoose";

// ============================================
// ORDER ITEM INTERFACE
// ============================================
export interface IOrderItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  sku: string;
  
  // Product name (snapshot at order time)
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  
  // Selected attributes (snapshot)
  selectedAttributes: {
    [optionCode: string]: {
      code: string;
      label: {
        ar: string;
        en: string;
        fr: string;
      };
      value?: string;
      hexColor?: string;
    };
  };
  
  // Pricing (snapshot at order time)
  pricing: {
    price: number;
    compareAtPrice?: number;
    cost?: number; // For profit calculation
  };
  
  // Quantity
  quantity: number;
  
  // Media
  image?: string;
  
  // Product type
  productType: 'simple' | 'configurable';
  
  // Return tracking
  returnInfo?: {
    status: "none" | "requested" | "approved" | "rejected" | "completed";
    reason?: string;
    quantity?: number;
    requestedAt?: Date;
    processedAt?: Date;
  };
}

// ============================================
// COUPON USAGE INTERFACE
// ============================================
export interface ICouponUsage {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  discount: number;
  freeShipping: boolean;
}

// ============================================
// SHIPPING ADDRESS INTERFACE
// ============================================
export interface IShippingAddress {
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  addressLine: string;
  postalCode?: string;
}

// ============================================
// ORDER INTERFACE
// ============================================
export interface IOrder extends Document {
  orderNumber: string; // Auto-generated unique order number
  user: mongoose.Types.ObjectId;

  // Order Items
  items: IOrderItem[];

  // Pricing
  pricing: {
    subtotal: number;
    shippingCost: number;
    couponDiscount: number;
    total: number;
  };

  // Shipping Details
  shipping: {
    address: IShippingAddress;
    method: "home_delivery" | "office_pickup";
    trackingNumber?: string;
    estimatedDeliveryDate?: Date;
    deliveredAt?: Date;
  };

  // Payment
  payment: {
    method: "cash_on_delivery";
    status: "pending" | "paid" | "failed" | "refunded";
  };

  // Order Status
  status: {
    current: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    history: {
      status: string;
      timestamp: Date;
      note?: string;
      updatedBy?: mongoose.Types.ObjectId; // Admin who updated
    }[];
  };

  // Notes
  notes: {
    customer?: string;
    admin?: string;
    internal?: string; // Private notes not shown to customer
  };

  // Return/Refund
  returns: {
    hasReturn: boolean;
    totalRefund: number;
    items: mongoose.Types.ObjectId[]; // References to items with returns
  };

  // Coupon
  coupon?: ICouponUsage;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;

  updateStatus: (newStatus: string, note?: string, adminId?: mongoose.Types.ObjectId) => void;
}

// ============================================
// SCHEMAS
// ============================================

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
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
    cost: Number,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  productType: {
    type: String,
    enum: ['simple', 'configurable'],
    required: true,
  },
  returnInfo: {
    status: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "completed"],
      default: "none",
    },
    reason: String,
    quantity: {
      type: Number,
      min: 0,
    },
    requestedAt: Date,
    processedAt: Date,
  },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  wilaya: {
    type: String,
    required: true,
  },
  commune: {
    type: String,
    required: true,
  },
  addressLine: {
    type: String,
    required: true,
  },
  postalCode: String,
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      shippingCost: {
        type: Number,
        required: true,
        min: 0,
      },
      couponDiscount: {
        type: Number,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    shipping: {
      address: {
        type: shippingAddressSchema,
        required: true,
      },
      method: {
        type: String,
        enum: ["home_delivery", "office_pickup"],
        required: true,
      },
      trackingNumber: String,
      estimatedDeliveryDate: Date,
      deliveredAt: Date,
    },
    payment: {
      method: {
        type: String,
        enum: ["cash_on_delivery"],
        default: "cash_on_delivery",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
        index: true,
      },
    },
    status: {
      current: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },
      history: [
        {
          status: {
            type: String,
            required: true,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          note: String,
          updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "Admin",
          },
        },
      ],
    },
    notes: {
      customer: String,
      admin: String,
      internal: String,
    },
    returns: {
      hasReturn: {
        type: Boolean,
        default: false,
        index: true,
      },
      totalRefund: {
        type: Number,
        default: 0,
        min: 0,
      },
      items: [{
        type: Schema.Types.ObjectId,
      }],
    },
    coupon: {
      code: String,
      type: {
        type: String,
        enum: ["percentage", "fixed", "free_shipping"],
      },
      discount: Number,
      freeShipping: Boolean,
    },
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// ============================================
// MIDDLEWARE
// ============================================

// Generate unique order number before saving
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Find the last order of today
    const lastOrder = await mongoose
      .model("Order")
      .findOne({
        orderNumber: new RegExp(`^${year}${month}${day}`),
      })
      .sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    this.orderNumber = `${year}${month}${day}${sequence.toString().padStart(4, "0")}`;
    
    // Initialize status history
    this.status.history = [{
      status: this.status.current,
      timestamp: new Date(),
    }];
  }
  
  next();
});

// Add status to history when status changes
orderSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified('status.current')) {
    this.status.history.push({
      status: this.status.current,
      timestamp: new Date(),
    });
  }
  next();
});

// ============================================
// INDEXES
// ============================================
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shipping.address.wilaya': 1 });
orderSchema.index({ 'pricing.total': -1 });

// ============================================
// VIRTUALS
// ============================================

// Total items count
orderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Total profit (if cost is tracked)
orderSchema.virtual('totalProfit').get(function () {
  const itemsProfit = this.items.reduce((profit, item) => {
    if (item.pricing.cost) {
      const itemProfit = (item.pricing.price - item.pricing.cost) * item.quantity;
      return profit + itemProfit;
    }
    return profit;
  }, 0);
  
  return itemsProfit - this.pricing.shippingCost;
});

// Check if order can be cancelled
orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.status.current);
});

// Check if order can have returns
orderSchema.virtual('canHaveReturns').get(function () {
  return this.status.current === 'delivered';
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// ============================================
// METHODS
// ============================================

// Add status update
orderSchema.methods.updateStatus = function(
  newStatus: string,
  note?: string,
  adminId?: mongoose.Types.ObjectId
) {
  this.status.current = newStatus;
  this.status.history.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy: adminId,
  });
  
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  if (newStatus === 'delivered') {
    this.shipping.deliveredAt = new Date();
    this.payment.status = 'paid';
  }
};

// Calculate refund for item return
orderSchema.methods.processItemReturn = function(
  itemId: mongoose.Types.ObjectId,
  returnQuantity: number,
  reason: string
) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in order');
  }
  
  if (returnQuantity > item.quantity) {
    throw new Error('Return quantity exceeds ordered quantity');
  }
  
  // Update item return info
  item.returnInfo = {
    status: 'requested',
    quantity: returnQuantity,
    reason,
    requestedAt: new Date(),
  };
  
  // Calculate refund amount
  const refundAmount = item.pricing.price * returnQuantity;
  this.returns.totalRefund += refundAmount;
  this.returns.hasReturn = true;
  
  if (!this.returns.items.includes(itemId)) {
    this.returns.items.push(itemId);
  }
  
  return refundAmount;
};

export default mongoose.model<IOrder>("Order", orderSchema);