import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId; // Reference to specific variant
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
  stock: number; // Current stock available
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

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
      type: Map,
      of: String,
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
  stock: Number,
});

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate subtotal before saving
cartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

// Index for faster queries
// cartSchema.index({ user: 1 });

export default mongoose.model<ICart>('Cart', cartSchema);