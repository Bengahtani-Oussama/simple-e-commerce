import { Request, Response } from "express";
import Section, { ISection } from "../models/Section";
import Product from "../models/Product";
import mongoose from "mongoose";

// ===================================
// HELPER FUNCTIONS
// ===================================

const generateSlug = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .slice(0, 50) + `-${Date.now()}`
  );
};

// ✨ NEW: Validate products have stock (batched query)
const validateProductsStock = async (
  productIds: string[],
): Promise<{
  valid: string[];
  invalid: string[];
  details: { [key: string]: string };
}> => {
  const valid: string[] = [];
  const invalid: string[] = [];
  const details: { [key: string]: string } = {};

  // Batch query - get all products at once
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  for (const productId of productIds) {
    const product = productMap.get(productId);

    if (!product) {
      invalid.push(productId);
      details[productId] = "Product not found or inactive";
      continue;
    }

    // Check if any variant has stock
    const hasStock = product.variants.some((v) => v.stock > 0 && v.isActive);

    if (hasStock) {
      valid.push(productId);
    } else {
      invalid.push(productId);
      details[productId] = "No stock available";
    }
  }

  return { valid, invalid, details };
};

// ===================================
// PUBLIC ROUTES
// ===================================

// @desc    Get all active sections (Public)
// @route   GET /api/sections/public
export const getPublicSections = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sections = await Section.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    // Populate products with stock info
    const populatedSections = await Promise.all(
      sections.map(async (section) => {
        const products = await Product.find({
          _id: { $in: section.productIds },
          isActive: true,
        })
          .select("name slug images basePrice compareAtPrice variants")
          .lean();

        // Filter products with stock
        const productsWithStock = products.filter((p) =>
          p.variants.some((v) => v.stock > 0 && v.isActive),
        );

        const sortedProducts = productsWithStock.sort((a, b) => {
          const posA =
            (section.productPositions as unknown as Map<string, number>)?.get(
              a._id.toString(),
            ) || 0;
          const posB =
            (section.productPositions as unknown as Map<string, number>)?.get(
              b._id.toString(),
            ) || 0;
          return posA - posB;
        });

        return {
          ...section,
          products: sortedProducts,
          productCount: sortedProducts.length,
        };
      }),
    );

    // Filter sections with minimum products
    const validSections = populatedSections.filter(
      (s) => s.productCount >= s.minProducts,
    );

    res.status(200).json({
      success: true,
      count: validSections.length,
      data: validSections,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sections",
    });
  }
};

// @desc    Get section by ID
// @route   GET /api/sections/:id
export const getSection = async (
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

    // Populate products
    const products = await Product.find({
      _id: { $in: section.productIds },
    }).select("name slug images basePrice compareAtPrice variants isActive");

    res.status(200).json({
      success: true,
      data: {
        ...section.toObject(),
        products,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch section",
    });
  }
};

// ===================================
// ADMIN ROUTES
// ===================================

// @desc    Get all sections (Admin)
// @route   GET /api/sections
export const getSections = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { active, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sections = await Section.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Section.countDocuments(filter);

    // Populate product counts
    const sectionsWithCounts = await Promise.all(
      sections.map(async (section) => {
        const validCount = await Product.countDocuments({
          _id: { $in: section.productIds },
          isActive: true,
        });

        return {
          ...section,
          validProductCount: validCount,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: sections.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: sectionsWithCounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sections",
    });
  }
};

// @desc    Create section (Admin)
// @route   POST /api/sections
export const createSection = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      description,
      productIds,
      isActive,
      order,
      minProducts,
      scheduling,
    } = req.body;

    // Validate required fields
    if (!name || !productIds || !Array.isArray(productIds)) {
      res.status(400).json({
        success: false,
        message: "Name and productIds array are required",
      });
      return;
    }

    // Validate minimum products
    const min = minProducts || 5;
    if (productIds.length < min) {
      res.status(400).json({
        success: false,
        message: `Section must have at least ${min} products`,
      });
      return;
    }

    // ✨ NEW: Validate stock in batch
    const stockCheck = await validateProductsStock(productIds);

    if (stockCheck.valid.length < min) {
      res.status(400).json({
        success: false,
        message: `Only ${stockCheck.valid.length} products have stock. Need at least ${min}`,
        data: {
          valid: stockCheck.valid,
          invalid: stockCheck.invalid,
          details: stockCheck.details,
        },
      });
      return;
    }

    // Generate slug
    const slug = generateSlug(name.en);

    // Create section
    const section = new Section({
      name,
      slug,
      description,
      productIds: stockCheck.valid,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      minProducts: min,
      scheduling: scheduling || {
        enabled: false,
        autoArchive: false,
      },
    });

    await section.save();

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create section",
    });
  }
};

// @desc    Update section (Admin)
// @route   PUT /api/sections/:id
export const updateSection = async (
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

    const { name, description, productIds, isActive, order, scheduling } =
      req.body;

    // If updating products, validate stock
    if (productIds && Array.isArray(productIds)) {
      const stockCheck = await validateProductsStock(productIds);

      if (stockCheck.valid.length < section.minProducts) {
        res.status(400).json({
          success: false,
          message: `Only ${stockCheck.valid.length} products have stock. Need at least ${section.minProducts}`,
          data: {
            valid: stockCheck.valid,
            invalid: stockCheck.invalid,
            details: stockCheck.details,
          },
        });
        return;
      }

      section.productIds = stockCheck.valid;

      // Clean up metadata for removed products
      section.pinnedProducts = section.pinnedProducts.filter((id) =>
        stockCheck.valid.includes(id),
      );
      section.featuredProducts = section.featuredProducts.filter((id) =>
        stockCheck.valid.includes(id),
      );
    }

    // Update other fields
    if (name) {
      section.name = name;
      section.slug = generateSlug(name.en);
    }
    if (description !== undefined) section.description = description;
    if (isActive !== undefined) section.isActive = isActive;
    if (order !== undefined) section.order = order;
    if (scheduling !== undefined) {
      section.scheduling = {
        ...section.scheduling,
        ...scheduling,
      };
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update section",
    });
  }
};

// @desc    Delete section (Admin)
// @route   DELETE /api/sections/:id
export const deleteSection = async (
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

    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete section",
    });
  }
};

// ===================================
// PRODUCT MANAGEMENT
// ===================================

// @desc    Add products to section (Admin)
// @route   POST /api/sections/:id/products
export const addProductsToSection = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      res.status(400).json({
        success: false,
        message: "productIds array is required",
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

    // Validate stock
    const stockCheck = await validateProductsStock(productIds);

    // Filter out already existing products
    const newProducts = stockCheck.valid.filter(
      (id) => !section.productIds.includes(id),
    );

    if (newProducts.length === 0) {
      res.status(400).json({
        success: false,
        message: "No new valid products to add",
      });
      return;
    }

    // Add products
    section.productIds.push(...newProducts);
    section.rebuildPositionMap();
    await section.save();

    res.status(200).json({
      success: true,
      message: `Added ${newProducts.length} products`,
      data: section,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add products",
    });
  }
};

// @desc    Remove product from section (Admin)
// @route   DELETE /api/sections/:id/products/:productId
export const removeProductFromSection = async (
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

    // Check minimum products constraint
    if (section.productIds.length <= section.minProducts) {
      res.status(400).json({
        success: false,
        message: `Cannot remove product. Section must have at least ${section.minProducts} products`,
      });
      return;
    }

    // const removed = section.removeProduct(req.params.productId);
    const removed = (section as ISection).removeProduct(req.params.productId);
    if (!removed) {
      res.status(404).json({
        success: false,
        message: "Product not found in section",
      });
      return;
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
      data: section,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove product",
    });
  }
};

export default {
  getPublicSections,
  getSection,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  addProductsToSection,
  removeProductFromSection,
};
