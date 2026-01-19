// backend/src/controllers/inventoryController.ts
import { Request, Response } from 'express';
import Product from '../models/Product';
import StockHistory from '../models/StockHistory';
import { AuthRequest } from '../types';

// @desc    Get inventory overview with low stock alerts
// @route   GET /api/admin/inventory/overview
export const getInventoryOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lowStockThreshold = 10 } = req.query;

    // Get all products with variants
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .select('name slug variants images category brand')
      .lean();

    // Flatten variants for inventory view
    const inventoryItems = [];
    for (const product of products) {
      for (const variant of product.variants) {
        inventoryItems.push({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          category: product.category,
          brand: product.brand,
          variantId: variant._id,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          material: variant.material,
          stock: variant.stock,
          price: variant.price,
          isActive: variant.isActive,
          image: variant.images[0] || product.images[0],
          isLowStock: variant.stock <= Number(lowStockThreshold),
        });
      }
    }

    // Calculate statistics
    const stats = {
      totalProducts: products.length,
      totalVariants: inventoryItems.length,
      lowStockItems: inventoryItems.filter((item) => item.isLowStock).length,
      outOfStock: inventoryItems.filter((item) => item.stock === 0).length,
      totalStockValue: inventoryItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.stock,
        0
      ),
    };

    res.status(200).json({
      success: true,
      data: {
        items: inventoryItems,
        stats,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch inventory overview',
    });
  }
};

// @desc    Adjust stock for a variant
// @route   POST /api/admin/inventory/adjust
export const adjustStock = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, variantId, adjustment, reason, type } = req.body;

    if (!productId || !variantId || adjustment === undefined) {
      res.status(400).json({
        success: false,
        message: 'Product ID, variant ID, and adjustment amount are required',
      });
      return;
    }

    // Find product and variant
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const variant = product.variants.find(
      (v) => v._id?.toString() === variantId
    );
    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
      return;
    }

    const previousStock = variant.stock;
    const newStock = previousStock + adjustment;

    if (newStock < 0) {
      res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
      return;
    }

    // Update stock
    variant.stock = newStock;
    await product.save();

    // Record in stock history
    await StockHistory.create({
      product: productId,
      variant: variantId,
      sku: variant.sku,
      type: type || 'adjustment',
      quantityChange: adjustment,
      previousStock,
      newStock,
      reason,
      performedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        sku: variant.sku,
        previousStock,
        newStock,
        adjustment,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to adjust stock',
    });
  }
};

// @desc    Get stock history for a variant
// @route   GET /api/admin/inventory/history/:productId/:variantId
export const getStockHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, variantId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const history = await StockHistory.find({
      product: productId,
      variant: variantId,
    })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockHistory.countDocuments({
      product: productId,
      variant: variantId,
    });

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stock history',
    });
  }
};

// @desc    Get all stock history (for reports)
// @route   GET /api/admin/inventory/history
export const getAllStockHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter: any = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const history = await StockHistory.find(filter)
      .populate('product', 'name')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockHistory.countDocuments(filter);

    // Calculate statistics
    const stats = {
      totalAdjustments: await StockHistory.countDocuments({
        ...filter,
        type: 'adjustment',
      }),
      totalSales: await StockHistory.countDocuments({
        ...filter,
        type: 'sale',
      }),
      totalReturns: await StockHistory.countDocuments({
        ...filter,
        type: 'return',
      }),
      totalRestocks: await StockHistory.countDocuments({
        ...filter,
        type: 'restock',
      }),
    };

    res.status(200).json({
      success: true,
      count: history.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch stock history',
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/admin/inventory/low-stock
export const getLowStockAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean();

    const lowStockItems = [];

    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.stock <= Number(threshold) && variant.isActive) {
          lowStockItems.push({
            productId: product._id,
            productName: product.name,
            category: product.category,
            brand: product.brand,
            variantId: variant._id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            image: variant.images[0] || product.images[0],
            urgency:
              variant.stock === 0
                ? 'critical'
                : variant.stock <= 5
                  ? 'high'
                  : 'medium',
          });
        }
      }
    }

    // Sort by stock (lowest first)
    lowStockItems.sort((a, b) => a.stock - b.stock);

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch low stock alerts',
    });
  }
};

// @desc    Bulk stock update
// @route   POST /api/admin/inventory/bulk-adjust
export const bulkStockAdjust = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { adjustments } = req.body; // Array of { productId, variantId, adjustment, reason }

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Adjustments array is required',
      });
      return;
    }

    const results = [];
    const errors = [];

    for (const adj of adjustments) {
      try {
        const product = await Product.findById(adj.productId);
        if (!product) {
          errors.push({ sku: adj.sku, error: 'Product not found' });
          continue;
        }

        const variant = product.variants.find(
          (v) => v._id?.toString() === adj.variantId
        );
        if (!variant) {
          errors.push({ sku: adj.sku, error: 'Variant not found' });
          continue;
        }

        const previousStock = variant.stock;
        const newStock = previousStock + adj.adjustment;

        if (newStock < 0) {
          errors.push({ sku: variant.sku, error: 'Stock cannot be negative' });
          continue;
        }

        variant.stock = newStock;
        await product.save();

        await StockHistory.create({
          product: adj.productId,
          variant: adj.variantId,
          sku: variant.sku,
          type: adj.type || 'adjustment',
          quantityChange: adj.adjustment,
          previousStock,
          newStock,
          reason: adj.reason,
          performedBy: req.user?.id,
        });

        results.push({
          sku: variant.sku,
          previousStock,
          newStock,
          adjustment: adj.adjustment,
        });
      } catch (error: any) {
        errors.push({ sku: adj.sku, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} adjustments completed successfully`,
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process bulk adjustments',
    });
  }
};