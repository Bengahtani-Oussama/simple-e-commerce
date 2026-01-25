import { Request, Response } from 'express';
import Section from '../models/Section';

// ===================================
// DRAG & DROP OPERATIONS
// ===================================

// @desc    Get section with ordered products (for DnD display)
// @route   GET /api/sections/:id/dnd
export const getSectionForDnD = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // Get ordered products with metadata
    const orderedProducts = section.getOrderedProducts();

    res.status(200).json({
      success: true,
      data: {
        sectionId: section._id,
        sectionName: section.name,
        products: orderedProducts,
        minProducts: section.minProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch section',
    });
  }
};

// @desc    Reorder products (Drag & Drop - PRIMARY METHOD)
// @route   PUT /api/sections/:id/dnd/reorder
export const reorderProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { newOrder } = req.body;

    // Validate input
    if (!Array.isArray(newOrder)) {
      res.status(400).json({
        success: false,
        message: 'newOrder must be an array of product IDs',
      });
      return;
    }

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // Validate all products exist in section
    const allExist = newOrder.every(id => section.productIds.includes(id));
    if (!allExist) {
      res.status(400).json({
        success: false,
        message: 'Some products are not in this section',
      });
      return;
    }

    // Validate same count (no products added/removed)
    if (newOrder.length !== section.productIds.length) {
      res.status(400).json({
        success: false,
        message: 'Product count mismatch',
      });
      return;
    }

    // ✨ ATOMIC UPDATE: Replace entire array
    section.productIds = newOrder;
    section.rebuildPositionMap();
    await section.save();

    res.status(200).json({
      success: true,
      message: 'Products reordered successfully',
      data: {
        products: section.getOrderedProducts(),
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reorder products',
    });
  }
};

// @desc    Move single product (Alternative method for single drag)
// @route   PUT /api/sections/:id/dnd/move
export const moveProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, newPosition } = req.body;

    if (!productId || newPosition === undefined) {
      res.status(400).json({
        success: false,
        message: 'productId and newPosition are required',
      });
      return;
    }

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const success = section.moveProduct(productId, newPosition);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: 'Product moved successfully',
      data: {
        products: section.getOrderedProducts(),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to move product',
    });
  }
};

// @desc    Toggle pin product
// @route   PUT /api/sections/:id/dnd/pin/:productId
export const togglePinProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const success = section.togglePin(req.params.productId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    await section.save();

    const isPinned = section.pinnedProducts.includes(req.params.productId);

    res.status(200).json({
      success: true,
      message: isPinned ? 'Product pinned' : 'Product unpinned',
      data: {
        productId: req.params.productId,
        isPinned,
        pinnedProducts: section.pinnedProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle pin',
    });
  }
};

// @desc    Toggle feature product
// @route   PUT /api/sections/:id/dnd/feature/:productId
export const toggleFeatureProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const success = section.toggleFeature(req.params.productId);

    if (!success) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    await section.save();

    const isFeatured = section.featuredProducts.includes(req.params.productId);

    res.status(200).json({
      success: true,
      message: isFeatured ? 'Product featured' : 'Product unfeatured',
      data: {
        productId: req.params.productId,
        isFeatured,
        featuredProducts: section.featuredProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle feature',
    });
  }
};

// @desc    Batch update (Pin/Feature multiple products)
// @route   PUT /api/sections/:id/dnd/batch
export const batchUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { pin, unpin, feature, unfeature } = req.body;

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // Process pins
    if (Array.isArray(pin)) {
      pin.forEach(productId => {
        if (
          section.productIds.includes(productId) &&
          !section.pinnedProducts.includes(productId)
        ) {
          section.pinnedProducts.push(productId);
        }
      });
    }

    // Process unpins
    if (Array.isArray(unpin)) {
      section.pinnedProducts = section.pinnedProducts.filter(
        id => !unpin.includes(id)
      );
    }

    // Process features
    if (Array.isArray(feature)) {
      feature.forEach(productId => {
        if (
          section.productIds.includes(productId) &&
          !section.featuredProducts.includes(productId)
        ) {
          section.featuredProducts.push(productId);
        }
      });
    }

    // Process unfeatures
    if (Array.isArray(unfeature)) {
      section.featuredProducts = section.featuredProducts.filter(
        id => !unfeature.includes(id)
      );
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: 'Batch update completed',
      data: {
        pinnedProducts: section.pinnedProducts,
        featuredProducts: section.featuredProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to batch update',
    });
  }
};

// @desc    Get pinned products
// @route   GET /api/sections/:id/dnd/pinned
export const getPinnedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const pinnedProducts = section
      .getOrderedProducts()
      .filter(p => p.isPinned);

    res.status(200).json({
      success: true,
      count: pinnedProducts.length,
      data: pinnedProducts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pinned products',
    });
  }
};

// @desc    Get featured products
// @route   GET /api/sections/:id/dnd/featured
export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const featuredProducts = section
      .getOrderedProducts()
      .filter(p => p.isFeatured);

    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      data: featuredProducts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get featured products',
    });
  }
};

export default {
  getSectionForDnD,
  reorderProducts,
  moveProduct,
  togglePinProduct,
  toggleFeatureProduct,
  batchUpdate,
  getPinnedProducts,
  getFeaturedProducts,
};