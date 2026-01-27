import { Request, Response } from "express";
import Section from "../models/Section";

// @desc    Get products with priority for a section
// @route   GET /api/admin/sections/:id/priorities
export const getSectionPriorities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: "productPriorities.product",
      select: "name slug images basePrice variants isActive",
    });

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found",
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
      message: error.message || "Failed to get section priorities",
    });
  }
};

// @desc    Pin/Unpin product to top
// @route   PUT /api/admin/sections/:id/priorities/:productId/pin
export const togglePinProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found",
      });
      return;
    }

    const success = section.togglePin(req.params.productId);

    // console.log('success :>> ', success);
    // console.log('section :>> ', section);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Product not found in section",
      });
      return;
    }

    await section.save();

    const isPinned = section.products.includes(req.params.productId as any);

    res.status(200).json({
      success: true,
      message: isPinned ? "Product pinned" : "Product unpinned",
      data: {
        productId: req.params.productId,
        isPinned,
        pinnedProducts: section.products,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle pin",
    });
  }
};

// @desc    Mark/Unmark product as featured
// @route   PUT /api/admin/sections/:id/priorities/:productId/feature
export const toggleFeatureProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found",
      });
      return;
    }

    const success = section.toggleFeature(req.params.productId as any);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "Product not found in section",
      });
      return;
    }

    await section.save();

    const isFeatured = section.featuredProducts.includes(
      req.params.productId as any,
    );

    res.status(200).json({
      success: true,
      message: isFeatured ? "Product featured" : "Product unfeatured",
      data: {
        productId: req.params.productId,
        isFeatured,
        featuredProducts: section.featuredProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle feature",
    });
  }
};

// @desc    Update product priority settings
// @route   PUT /api/admin/sections/:id/priorities/:productId
export const updateProductPriority = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { position, isPinned, isFeatured, customNote } = req.body;

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found",
      });
      return;
    }

    const priority = section.productPriorities.find(
      (p) => p.product.toString() === req.params.productId,
    );

    if (!priority) {
      res.status(404).json({
        success: false,
        message: "Product not found in section",
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
      path: "productPriorities.product",
      select: "name slug images",
    });

    res.status(200).json({
      success: true,
      message: "Product priority updated successfully",
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product priority",
    });
  }
};

// @desc    Bulk update product priorities
// @route   PUT /api/admin/sections/:id/priorities/bulk
export const bulkUpdatePriorities = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { productId, position?, isPinned?, isFeatured?, customNote? }

    if (!Array.isArray(updates)) {
      res.status(400).json({
        success: false,
        message: "updates must be an array",
      });
      return;
    }

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: "Section not found",
      });
      return;
    }

    // Apply updates
    for (const update of updates) {
      const priority = section.productPriorities.find(
        (p) => p.product.toString() === update.productId,
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
      path: "productPriorities.product",
      select: "name slug images",
    });

    res.status(200).json({
      success: true,
      message: `${updates.length} product priorities updated`,
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to bulk update priorities",
    });
  }
};

export default {
  getSectionPriorities,
  togglePinProduct,
  toggleFeatureProduct,
  updateProductPriority,
  bulkUpdatePriorities,
};
