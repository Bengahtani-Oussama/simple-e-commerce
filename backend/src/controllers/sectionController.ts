import { Request, Response } from 'express';
import Section from '../models/section';
import Product from '../models/Product';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

// Helper function to generate slug
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 50);
};

// Helper function to check product stock availability
const checkProductsStock = async (productIds: string[]): Promise<{
  valid: boolean;
  outOfStock: string[];
  validProducts: string[];
}> => {
  const outOfStock: string[] = [];
  const validProducts: string[] = [];

  for (const productId of productIds) {
    const product = await Product.findById(productId);
    
    if (!product) {
      continue; // Skip non-existent products
    }

    // Check if product has any variant with stock > 0
    const hasStock = product.variants.some(
      (variant) => variant.stock > 0 && variant.isActive
    );

    if (hasStock && product.isActive) {
      validProducts.push(productId);
    } else {
      outOfStock.push(productId);
    }
  }

  return {
    valid: validProducts.length >= 5, // Minimum 5 products with stock
    outOfStock,
    validProducts,
  };
};

// @desc    Get all sections (with filters)
// @route   GET /api/sections
export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sections = await Section.find(filter)
      .populate({
        path: 'products',
        match: { isActive: true },
        select: 'name slug images basePrice compareAtPrice variants',
      })
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Section.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: sections.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: sections,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sections',
    });
  }
};

// @desc    Get sections for public display (only active sections with in-stock products)
// @route   GET /api/sections/public
export const getPublicSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await Section.find({ isActive: true })
      .populate({
        path: 'products',
        match: { isActive: true },
        select: 'name slug images basePrice compareAtPrice variants featured',
      })
      .sort({ order: 1 });

    // Filter sections and products based on stock availability
    const filteredSections = await Promise.all(
      sections.map(async (section) => {
        const sectionObj = section.toObject();
        
        // Filter products with stock
        const productsWithStock = sectionObj.products.filter((product: any) => {
          if (!product) return false;
          return product.variants.some(
            (variant: any) => variant.stock > 0 && variant.isActive
          );
        });

        // Only include section if it has minimum required products
        if (productsWithStock.length >= section.minProducts) {
          return {
            ...sectionObj,
            products: productsWithStock,
            activeProductCount: productsWithStock.length,
          };
        }
        return null;
      })
    );

    // Remove null sections (those with insufficient products)
    const validSections = filteredSections.filter((s) => s !== null);

    res.status(200).json({
      success: true,
      count: validSections.length,
      data: validSections,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch public sections',
    });
  }
};

// @desc    Get single section
// @route   GET /api/sections/:id
export const getSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate({
      path: 'products',
      select: 'name slug images basePrice compareAtPrice variants isActive',
    });

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch section',
    });
  }
};

// @desc    Create section (Admin)
// @route   POST /api/admin/sections
export const createSection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, products, isActive, order, minProducts } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length < (minProducts || 5)) {
      res.status(400).json({
        success: false,
        message: `Section must have at least ${minProducts || 5} products`,
      });
      return;
    }

    // Check product stock availability
    const stockCheck = await checkProductsStock(products);

    if (!stockCheck.valid) {
      res.status(400).json({
        success: false,
        message: `Insufficient products with stock. Found ${stockCheck.validProducts.length}, need at least 5`,
        data: {
          outOfStock: stockCheck.outOfStock,
          validProducts: stockCheck.validProducts,
        },
      });
      return;
    }

    // Generate slug from English name
    const slug = generateSlug(name.en) + `-${Date.now()}`;

    const section = await Section.create({
      name,
      slug,
      description,
      products: stockCheck.validProducts, // Only include products with stock
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      minProducts: minProducts || 5,
    });

    const populatedSection = await Section.findById(section._id).populate({
      path: 'products',
      select: 'name slug images basePrice variants',
    });

    res.status(201).json({
      success: true,
      message: 'Section created successfully',
      data: populatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create section',
    });
  }
};

// @desc    Update section (Admin)
// @route   PUT /api/admin/sections/:id
export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, products, isActive, order } = req.body;

    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // If products are being updated, validate stock
    if (products && Array.isArray(products)) {
      const stockCheck = await checkProductsStock(products);

      if (!stockCheck.valid) {
        res.status(400).json({
          success: false,
          message: `Insufficient products with stock. Found ${stockCheck.validProducts.length}, need at least ${section.minProducts}`,
          data: {
            outOfStock: stockCheck.outOfStock,
            validProducts: stockCheck.validProducts,
          },
        });
        return;
      }

      section.products = stockCheck.validProducts.map(
        (id) => new mongoose.Types.ObjectId(id)
      );
    }

    // Update other fields
    if (name) {
      section.name = name;
      section.slug = generateSlug(name.en) + `-${Date.now()}`;
    }
    if (description !== undefined) section.description = description;
    if (isActive !== undefined) section.isActive = isActive;
    if (order !== undefined) section.order = order;

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'products',
      select: 'name slug images basePrice variants',
    });

    res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update section',
    });
  }
};

// @desc    Delete section (Admin)
// @route   DELETE /api/admin/sections/:id
export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete section',
    });
  }
};

// @desc    Add products to section (Admin)
// @route   POST /api/admin/sections/:id/products
export const addProductsToSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      res.status(400).json({
        success: false,
        message: 'Product IDs array is required',
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

    // Check stock for new products
    const stockCheck = await checkProductsStock(productIds);

    // Add only valid products (avoid duplicates)
    const existingIds = section.products.map((id) => id.toString());
    const newProducts = stockCheck.validProducts.filter(
      (id) => !existingIds.includes(id)
    );

    if (newProducts.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No new valid products to add',
      });
      return;
    }

    section.products.push(
      ...newProducts.map((id) => new mongoose.Types.ObjectId(id))
    );
    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'products',
      select: 'name slug images basePrice variants',
    });

    res.status(200).json({
      success: true,
      message: `Added ${newProducts.length} products to section`,
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add products to section',
    });
  }
};

// @desc    Remove product from section (Admin)
// @route   DELETE /api/admin/sections/:id/products/:productId
export const removeProductFromSection = async (
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

    const initialCount = section.products.length;
    section.products = section.products.filter(
      (id) => id.toString() !== req.params.productId
    );

    // Check if removal violates minimum products requirement
    if (section.products.length < section.minProducts) {
      res.status(400).json({
        success: false,
        message: `Cannot remove product. Section must have at least ${section.minProducts} products`,
      });
      return;
    }

    if (section.products.length === initialCount) {
      res.status(404).json({
        success: false,
        message: 'Product not found in section',
      });
      return;
    }

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'products',
      select: 'name slug images basePrice variants',
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from section',
      data: updatedSection,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove product from section',
    });
  }
};

// @desc    Clean out-of-stock products from section (Admin/Automated)
// @route   POST /api/admin/sections/:id/clean-stock
export const cleanOutOfStockProducts = async (
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

    const productIds = section.products.map((id) => id.toString());
    const stockCheck = await checkProductsStock(productIds);

    const removedCount = section.products.length - stockCheck.validProducts.length;

    section.products = stockCheck.validProducts.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    // Check if cleaning violates minimum requirement
    if (section.products.length < section.minProducts) {
      res.status(400).json({
        success: false,
        message: `Cannot clean. Would result in ${section.products.length} products, need at least ${section.minProducts}`,
        data: {
          currentProducts: section.products.length,
          minRequired: section.minProducts,
          wouldRemove: removedCount,
        },
      });
      return;
    }

    await section.save();

    const updatedSection = await Section.findById(section._id).populate({
      path: 'products',
      select: 'name slug images basePrice variants',
    });

    res.status(200).json({
      success: true,
      message: `Removed ${removedCount} out-of-stock products`,
      data: {
        section: updatedSection,
        removedCount,
        outOfStockProducts: stockCheck.outOfStock,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clean out-of-stock products',
    });
  }
};

// @desc    Clean all sections (remove out-of-stock products from all sections)
// @route   POST /api/admin/sections/clean-all-stock
export const cleanAllSectionsStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sections = await Section.find({ isActive: true });
    
    let totalCleaned = 0;
    const results = [];

    for (const section of sections) {
      const productIds = section.products.map((id) => id.toString());
      const stockCheck = await checkProductsStock(productIds);

      const removedCount = section.products.length - stockCheck.validProducts.length;

      // Only update if we can maintain minimum products
      if (stockCheck.validProducts.length >= section.minProducts) {
        section.products = stockCheck.validProducts.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        await section.save();
        totalCleaned += removedCount;

        results.push({
          sectionId: section._id,
          sectionName: section.name.en,
          removedCount,
          remainingProducts: section.products.length,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleaned ${totalCleaned} out-of-stock products from ${results.length} sections`,
      data: {
        totalCleaned,
        sectionsProcessed: results.length,
        details: results,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clean all sections',
    });
  }
};

export default {
  getSections,
  getPublicSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  addProductsToSection,
  removeProductFromSection,
  cleanOutOfStockProducts,
  cleanAllSectionsStock,
};