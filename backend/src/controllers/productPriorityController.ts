import { Request, Response } from 'express';
import Section from '../models/Section';
import Product from '../models/Product';
import mongoose from 'mongoose';

// @desc    Get products with priority for a section
// @route   GET /api/admin/sections/:id/priorities
export const getSectionPriorities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: 'productPriorities.product',
      select: 'name slug images basePrice variants isActive',
    });

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // Sort by pinned first, then by position
    const orderedProducts = [...section.productPriorities].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return a.position - b.position;
    });

    res.status(200).json({
      success: true,
      data: {
        sectionId: section._id,
        sectionName: section.name,
        products: orderedProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get section priorities',
    });
  }
};

// @desc    Update product positions (drag and drop)
// @route   PUT /api/admin/sections/:id/priorities/reorder
export const reorderProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productOrder } = req.body; // Array of { productId, position }

    if (!Array.isArray(productOrder)) {
      res.status(400).json({
        success: false,
        message: 'productOrder must be an array',
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

    // Update positions for each product
    for (const item of productOrder) {
      const priority = section.productPriorities.find(
        (p) => p.product.toString() === item.productId
      );

      if (priority) {
        priority.position = item.position;
      }
    }

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images basePrice',
    });

    res.status(200).json({
      success: true,
      message: 'Product order updated successfully',
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reorder products',
    });
  }
};

// @desc    Pin/Unpin product to top
// @route   PUT /api/admin/sections/:id/priorities/:productId/pin
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

    const priority = section.productPriorities.find(
      (p) => p.product.toString() === req.params.productId
    );

    if (!priority) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    priority.isPinned = !priority.isPinned;
    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images',
    });

    res.status(200).json({
      success: true,
      message: priority.isPinned
        ? 'Product pinned to top'
        : 'Product unpinned',
      data: {
        productId: req.params.productId,
        isPinned: priority.isPinned,
        section: updatedSection,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle pin',
    });
  }
};

// @desc    Mark/Unmark product as featured
// @route   PUT /api/admin/sections/:id/priorities/:productId/feature
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

    const priority = section.productPriorities.find(
      (p) => p.product.toString() === req.params.productId
    );

    if (!priority) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    priority.isFeatured = !priority.isFeatured;
    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images',
    });

    res.status(200).json({
      success: true,
      message: priority.isFeatured
        ? 'Product marked as featured'
        : 'Product unmarked as featured',
      data: {
        productId: req.params.productId,
        isFeatured: priority.isFeatured,
        section: updatedSection,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle feature',
    });
  }
};

// @desc    Update product priority settings
// @route   PUT /api/admin/sections/:id/priorities/:productId
export const updateProductPriority = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { position, isPinned, isFeatured, customNote } = req.body;

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const priority = section.productPriorities.find(
      (p) => p.product.toString() === req.params.productId
    );

    if (!priority) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    // Update fields if provided
    if (position !== undefined) priority.position = position;
    if (isPinned !== undefined) priority.isPinned = isPinned;
    if (isFeatured !== undefined) priority.isFeatured = isFeatured;
    if (customNote !== undefined) priority.customNote = customNote;

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images',
    });

    res.status(200).json({
      success: true,
      message: 'Product priority updated successfully',
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product priority',
    });
  }
};

// @desc    Move product to specific position
// @route   PUT /api/admin/sections/:id/priorities/:productId/move
export const moveProductToPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { newPosition } = req.body;

    if (newPosition === undefined || newPosition < 0) {
      res.status(400).json({
        success: false,
        message: 'Valid newPosition is required (0 or greater)',
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

    const productIndex = section.productPriorities.findIndex(
      (p) => p.product.toString() === req.params.productId
    );

    if (productIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    // Get current position
    const currentPosition = section.productPriorities[productIndex].position;

    // If moving down, shift others up
    if (newPosition > currentPosition) {
      section.productPriorities.forEach((p) => {
        if (p.position > currentPosition && p.position <= newPosition) {
          p.position--;
        }
      });
    }
    // If moving up, shift others down
    else if (newPosition < currentPosition) {
      section.productPriorities.forEach((p) => {
        if (p.position >= newPosition && p.position < currentPosition) {
          p.position++;
        }
      });
    }

    // Update the moved product's position
    section.productPriorities[productIndex].position = newPosition;

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images',
    });

    res.status(200).json({
      success: true,
      message: `Product moved to position ${newPosition}`,
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to move product',
    });
  }
};

// @desc    Get pinned products for a section
// @route   GET /api/admin/sections/:id/priorities/pinned
export const getPinnedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: 'productPriorities.product',
      select: 'name slug images basePrice',
    });

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const pinnedProducts = section.productPriorities
      .filter((p) => p.isPinned)
      .sort((a, b) => a.position - b.position);

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

// @desc    Get featured products for a section
// @route   GET /api/admin/sections/:id/priorities/featured
export const getFeaturedProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: 'productPriorities.product',
      select: 'name slug images basePrice',
    });

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    const featuredProducts = section.productPriorities
      .filter((p) => p.isFeatured)
      .sort((a, b) => a.position - b.position);

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

// @desc    Bulk update product priorities
// @route   PUT /api/admin/sections/:id/priorities/bulk
export const bulkUpdatePriorities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { productId, position?, isPinned?, isFeatured?, customNote? }

    if (!Array.isArray(updates)) {
      res.status(400).json({
        success: false,
        message: 'updates must be an array',
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

    // Apply updates
    for (const update of updates) {
      const priority = section.productPriorities.find(
        (p) => p.product.toString() === update.productId
      );

      if (priority) {
        if (update.position !== undefined) priority.position = update.position;
        if (update.isPinned !== undefined) priority.isPinned = update.isPinned;
        if (update.isFeatured !== undefined)
          priority.isFeatured = update.isFeatured;
        if (update.customNote !== undefined)
          priority.customNote = update.customNote;
      }
    }

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'productPriorities.product',
      select: 'name slug images',
    });

    res.status(200).json({
      success: true,
      message: `${updates.length} product priorities updated`,
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to bulk update priorities',
    });
  }
};

export default {
  getSectionPriorities,
  reorderProducts,
  togglePinProduct,
  toggleFeatureProduct,
  updateProductPriority,
  moveProductToPosition,
  getPinnedProducts,
  getFeaturedProducts,
  bulkUpdatePriorities,
};