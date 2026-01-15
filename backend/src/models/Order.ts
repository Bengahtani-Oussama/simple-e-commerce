import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  sku: string;
  name: {
    ar: string;
    en: string;
    fr: string;
  };
  variantDetails: {
    size?: string;
    color?: string;
    material?: string;
    customOptions?: { [key: string]: string };
  };
  price: number;
  quantity: number;
  image?: string;
  
  // Return tracking
  returnStatus?: 'none' | 'requested' | 'approved' | 'rejected' | 'completed';
  returnReason?: string;
  returnQuantity?: number;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  addressLine: string;
  postalCode?: string;
}

export interface IOrder extends Document {
  orderNumber: string; // Auto-generated unique order number
  user: mongoose.Types.ObjectId;
  
  // Order Items
  items: IOrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number; // Set based on wilaya
  total: number;
  
  // Shipping Details
  shippingAddress: IShippingAddress;
  shippingMethod: 'home_delivery' | 'office_pickup'; // Home delivery or pickup from office
  
  // Payment
  paymentMethod: 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Order Status
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  
  // Tracking
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
  
  // Notes
  customerNote?: string;
  adminNote?: string;
  
  // Return/Refund
  hasReturn: boolean;
  returnTotal: number; // Total amount for returned items
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
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
  },
  name: {
    ar: String,
    en: String,
    fr: String,
  },
  variantDetails: {
    size: String,
    color: String,
    material: String,
    customOptions: {
      type: Object,
      default: {},
    },
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  returnStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected', 'completed'],
    default: 'none',
  },
  returnReason: String,
  returnQuantity: {
    type: Number,
    default: 0,
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
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
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
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ['home_delivery', 'office_pickup'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery'],
      default: 'cash_on_delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    deliveredAt: Date,
    customerNote: String,
    adminNote: String,
    hasReturn: {
      type: Boolean,
      default: false,
    },
    returnTotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number before saving
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find the last order of today
    const lastOrder = await mongoose.model('Order').findOne({
      orderNumber: new RegExp(`^${year}${month}${day}`),
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes
// orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);