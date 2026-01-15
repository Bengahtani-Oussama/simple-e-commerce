import { Request, Response } from 'express';
import Category from '../models/Category';
import cloudinary from '../config/cloudinary';

// @desc    Get all categories (with subcategories)
// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parent, active } = req.query;
    
    const filter: any = {};
    
    // Filter by parent (main categories or subcategories)
    if (parent === 'null') {
      filter.parent = null;
    } else if (parent) {
      filter.parent = parent;
    }
    
    // Filter by active status
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const categories = await Category.find(filter)
      .populate('subcategories')
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories',
    });
  }
};

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
export const getCategoryTree = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all main categories with their subcategories
    const mainCategories = await Category.find({ parent: null, isActive: true })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
      })
      .sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: mainCategories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch category tree',
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id).populate('subcategories');
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch category',
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }
    
    // Check if category has subcategories
    const hasSubcategories = await Category.countDocuments({ parent: category._id });
    if (hasSubcategories > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories',
      });
      return;
    }
    
    // Delete image from Cloudinary if exists
    if (category.image) {
      const publicId = category.image.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`ecommerce/categories/${publicId}`);
      }
    }
    
    await category.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category',
    });
  }
};