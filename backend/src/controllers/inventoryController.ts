import { Request, Response } from 'express';
import Product from '../models/Product';
import StockHistory from '../models/StockHistory';
import { AuthRequest } from '../types';

// ============================================
// GET INVENTORY OVERVIEW
// ============================================
export const getInventoryOverview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { lowStockThreshold = 10 } = req.query;
    const threshold = Number(lowStockThreshold);

    // Get all active products
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('brand', 'name')
      .select('name slug type variants basePricing baseInventory images category brand')
      .lean();

    // Flatten variants for inventory view
    const inventoryItems = [];

    for (const product of products) {
      if (product.type === 'configurable') {
        // Process variants
        for (const variant of product.variants) {
          const isLowStock = variant.inventory.lowStockThreshold
            ? variant.inventory.stock <= variant.inventory.lowStockThreshold
            : variant.inventory.stock <= threshold;

          inventoryItems.push({
            productId: product._id,
            productName: product.name,
            productSlug: product.slug,
            productType: 'configurable',
            category: product.category,
            brand: product.brand,
            variantId: variant._id,
            sku: variant.sku,
            attributes: Object.fromEntries(Object.entries(variant.attributes)),
            price: variant.pricing.price,
            cost: variant.pricing.cost,
            stock: variant.inventory.stock,
            trackInventory: variant.inventory.trackInventory,
            allowBackorder: variant.inventory.allowBackorder,
            lowStockThreshold: variant.inventory.lowStockThreshold || threshold,
            status: variant.status,
            image: variant.images[0] || product.images[0],
            isLowStock,
            isOutOfStock: variant.inventory.stock === 0,
          });
        }
      } else {
        // Simple product
        const stock = product.baseInventory?.stock || 0;
        const isLowStock = stock <= threshold;

        inventoryItems.push({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          productType: 'simple',
          category: product.category,
          brand: product.brand,
          variantId: null,
          sku: `SIMPLE-${product._id}`,
          attributes: {},
          price: product.basePricing.price,
          cost: product.basePricing.cost,
          stock,
          trackInventory: product.baseInventory?.trackInventory || true,
          allowBackorder: product.baseInventory?.allowBackorder || false,
          lowStockThreshold: threshold,
          status: 'active',
          image: product.images[0],
          isLowStock,
          isOutOfStock: stock === 0,
        });
      }
    }

    // Calculate statistics
    const stats = {
      totalProducts: products.length,
      totalVariants: inventoryItems.length,
      configurableProducts: products.filter((p) => p.type === 'configurable').length,
      simpleProducts: products.filter((p) => p.type === 'simple').length,
      lowStockItems: inventoryItems.filter((item) => item.isLowStock && !item.isOutOfStock).length,
      outOfStock: inventoryItems.filter((item) => item.isOutOfStock).length,
      totalStockValue: inventoryItems.reduce(
        (sum, item) => sum + item.price * item.stock,
        0
      ),
      totalInventoryValue: inventoryItems.reduce(
        (sum, item) => sum + (item.cost || item.price) * item.stock,
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

// ============================================
// ADJUST STOCK FOR A VARIANT
// ============================================
export const adjustStock = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, variantId, adjustment, reason, type } = req.body;

    if (!productId || adjustment === undefined) {
      res.status(400).json({
        success: false,
        message: 'Product ID and adjustment amount are required',
      });
      return;
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    let previousStock = 0;
    let newStock = 0;
    let sku = '';

    if (product.type === 'configurable') {
      // Configurable product - variant required
      if (!variantId) {
        res.status(400).json({
          success: false,
          message: 'Variant ID is required for configurable products',
        });
        return;
      }

      const variantIndex = product.variants.findIndex(
        (v) => v._id?.toString() === variantId
      );

      if (variantIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Variant not found',
        });
        return;
      }

      const variant = product.variants[variantIndex];
      previousStock = variant.inventory.stock;
      newStock = previousStock + adjustment;

      if (newStock < 0) {
        res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
        return;
      }

      // Update stock
      variant.inventory.stock = newStock;
      
      // Update status based on stock
      if (newStock === 0) {
        variant.status = 'out_of_stock';
      } else if (variant.status === 'out_of_stock') {
        variant.status = 'active';
      }

      sku = variant.sku;
    } else {
      // Simple product
      previousStock = product.baseInventory?.stock || 0;
      newStock = previousStock + adjustment;

      if (newStock < 0) {
        res.status(400).json({
          success: false,
          message: 'Stock cannot be negative',
        });
        return;
      }

      if (!product.baseInventory) {
        product.baseInventory = {
          stock: newStock,
          trackInventory: true,
          allowBackorder: false,
        };
      } else {
        product.baseInventory.stock = newStock;
      }

      sku = `SIMPLE-${product._id}`;
    }

    await product.save();

    // Record in stock history
    await StockHistory.create({
      product: productId,
      variant: variantId || productId,
      sku,
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
        sku,
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

// ============================================
// GET STOCK HISTORY
// ============================================
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

    const filter: any = { product: productId };
    if (variantId) {
      filter.variant = variantId;
    }

    const history = await StockHistory.find(filter)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await StockHistory.countDocuments(filter);

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

// ============================================
// GET ALL STOCK HISTORY
// ============================================
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

// ============================================
// GET LOW STOCK ALERTS
// ============================================
export const getLowStockAlerts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { threshold = 10 } = req.query;
    const defaultThreshold = Number(threshold);

    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean();

    const lowStockItems = [];

    for (const product of products) {
      if (product.type === 'configurable') {
        for (const variant of product.variants) {
          const variantThreshold = variant.inventory.lowStockThreshold || defaultThreshold;
          
          if (
            variant.inventory.stock <= variantThreshold && 
            variant.status === 'active' &&
            variant.inventory.trackInventory
          ) {
            lowStockItems.push({
              productId: product._id,
              productName: product.name,
              category: product.category,
              brand: product.brand,
              variantId: variant._id,
              sku: variant.sku,
              attributes: Object.fromEntries(Object.entries(variant.attributes)),
              stock: variant.inventory.stock,
              threshold: variantThreshold,
              image: variant.images[0] || product.images[0],
              urgency:
                variant.inventory.stock === 0
                  ? 'critical'
                  : variant.inventory.stock <= 5
                    ? 'high'
                    : 'medium',
            });
          }
        }
      } else {
        // Simple product
        const stock = product.baseInventory?.stock || 0;
        
        if (
          stock <= defaultThreshold &&
          (product.baseInventory?.trackInventory !== false)
        ) {
          lowStockItems.push({
            productId: product._id,
            productName: product.name,
            category: product.category,
            brand: product.brand,
            variantId: null,
            sku: `SIMPLE-${product._id}`,
            attributes: {},
            stock,
            threshold: defaultThreshold,
            image: product.images[0],
            urgency:
              stock === 0
                ? 'critical'
                : stock <= 5
                  ? 'high'
                  : 'medium',
          });
        }
      }
    }

    // Sort by urgency and stock level
    lowStockItems.sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, medium: 2 };
      if (urgencyOrder[a.urgency as keyof typeof urgencyOrder] !== urgencyOrder[b.urgency as keyof typeof urgencyOrder]) {
        return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
      }
      return a.stock - b.stock;
    });

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

// ============================================
// BULK STOCK ADJUST
// ============================================
export const bulkStockAdjust = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { adjustments } = req.body;

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

        let previousStock = 0;
        let newStock = 0;
        let sku = '';

        if (product.type === 'configurable') {
          if (!adj.variantId) {
            errors.push({ sku: adj.sku, error: 'Variant ID required' });
            continue;
          }

          const variantIndex = product.variants.findIndex(
            (v) => v._id?.toString() === adj.variantId
          );

          if (variantIndex === -1) {
            errors.push({ sku: adj.sku, error: 'Variant not found' });
            continue;
          }

          const variant = product.variants[variantIndex];
          previousStock = variant.inventory.stock;
          newStock = previousStock + adj.adjustment;

          if (newStock < 0) {
            errors.push({ sku: variant.sku, error: 'Stock cannot be negative' });
            continue;
          }

          variant.inventory.stock = newStock;
          
          if (newStock === 0) {
            variant.status = 'out_of_stock';
          } else if (variant.status === 'out_of_stock') {
            variant.status = 'active';
          }

          sku = variant.sku;
        } else {
          previousStock = product.baseInventory?.stock || 0;
          newStock = previousStock + adj.adjustment;

          if (newStock < 0) {
            errors.push({ sku: adj.sku, error: 'Stock cannot be negative' });
            continue;
          }

          if (!product.baseInventory) {
            product.baseInventory = {
              stock: newStock,
              trackInventory: true,
              allowBackorder: false,
            };
          } else {
            product.baseInventory.stock = newStock;
          }

          sku = `SIMPLE-${product._id}`;
        }

        await product.save();

        await StockHistory.create({
          product: adj.productId,
          variant: adj.variantId || adj.productId,
          sku,
          type: adj.type || 'adjustment',
          quantityChange: adj.adjustment,
          previousStock,
          newStock,
          reason: adj.reason,
          performedBy: req.user?.id,
        });

        results.push({
          sku,
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

// ============================================
// GET INVENTORY VALUE REPORT
// ============================================
export const getInventoryValueReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await Product.find({ status: 'active' })
      .populate('category', 'name')
      .populate('brand', 'name')
      .lean();

    let totalStockValue = 0;
    let totalCostValue = 0;
    let totalPotentialProfit = 0;

    const categoryBreakdown: any = {};
    const brandBreakdown: any = {};

    for (const product of products) {
      if (product.type === 'configurable') {
        for (const variant of product.variants) {
          const stockValue = variant.pricing.price * variant.inventory.stock;
          const costValue = (variant.pricing.cost || variant.pricing.price) * variant.inventory.stock;
          const profit = stockValue - costValue;

          totalStockValue += stockValue;
          totalCostValue += costValue;
          totalPotentialProfit += profit;

          // Category breakdown
          const categoryName = (product.category as any)?.name?.en || 'Uncategorized';
          if (!categoryBreakdown[categoryName]) {
            categoryBreakdown[categoryName] = { value: 0, cost: 0, profit: 0 };
          }
          categoryBreakdown[categoryName].value += stockValue;
          categoryBreakdown[categoryName].cost += costValue;
          categoryBreakdown[categoryName].profit += profit;

          // Brand breakdown
          if (product.brand) {
            const brandName = (product.brand as any)?.name || 'Unknown';
            if (!brandBreakdown[brandName]) {
              brandBreakdown[brandName] = { value: 0, cost: 0, profit: 0 };
            }
            brandBreakdown[brandName].value += stockValue;
            brandBreakdown[brandName].cost += costValue;
            brandBreakdown[brandName].profit += profit;
          }
        }
      } else {
        const stock = product.baseInventory?.stock || 0;
        const stockValue = product.basePricing.price * stock;
        const costValue = (product.basePricing.cost || product.basePricing.price) * stock;
        const profit = stockValue - costValue;

        totalStockValue += stockValue;
        totalCostValue += costValue;
        totalPotentialProfit += profit;

        // Category breakdown
        const categoryName = (product.category as any)?.name?.en || 'Uncategorized';
        if (!categoryBreakdown[categoryName]) {
          categoryBreakdown[categoryName] = { value: 0, cost: 0, profit: 0 };
        }
        categoryBreakdown[categoryName].value += stockValue;
        categoryBreakdown[categoryName].cost += costValue;
        categoryBreakdown[categoryName].profit += profit;

        // Brand breakdown
        if (product.brand) {
          const brandName = (product.brand as any)?.name || 'Unknown';
          if (!brandBreakdown[brandName]) {
            brandBreakdown[brandName] = { value: 0, cost: 0, profit: 0 };
          }
          brandBreakdown[brandName].value += stockValue;
          brandBreakdown[brandName].cost += costValue;
          brandBreakdown[brandName].profit += profit;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStockValue,
          totalCostValue,
          totalPotentialProfit,
          profitMargin: totalStockValue > 0 
            ? ((totalPotentialProfit / totalStockValue) * 100).toFixed(2) 
            : 0,
        },
        byCategory: categoryBreakdown,
        byBrand: brandBreakdown,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate inventory value report',
    });
  }
};