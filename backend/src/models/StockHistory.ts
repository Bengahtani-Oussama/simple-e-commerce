// backend/src/models/StockHistory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IStockHistory extends Document {
  product: mongoose.Types.ObjectId;
  variant: mongoose.Types.ObjectId;
  sku: string;
  type: 'adjustment' | 'sale' | 'return' | 'restock' | 'correction';
  quantityChange: number; // Positive for additions, negative for reductions
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: mongoose.Types.ObjectId; // Admin who made the change
  orderId?: mongoose.Types.ObjectId; // If related to an order
  createdAt: Date;
}

const stockHistorySchema = new Schema<IStockHistory>(
  {
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
    type: {
      type: String,
      required: true,
      enum: ['adjustment', 'sale', 'return', 'restock', 'correction'],
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
stockHistorySchema.index({ product: 1, variant: 1 });
stockHistorySchema.index({ sku: 1 });
stockHistorySchema.index({ createdAt: -1 });
stockHistorySchema.index({ type: 1 });

export default mongoose.model<IStockHistory>('StockHistory', stockHistorySchema);