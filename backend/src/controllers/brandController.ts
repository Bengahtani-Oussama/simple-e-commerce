import { Request, Response } from 'express';
import Brand from '../models/Brand';
import cloudinary from '../config/cloudinary';

// @desc    Get all brands
// @route   GET /api/brands
export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;
    
    const filter: any = {};
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }
    
    const brands = await Brand.find(filter).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch brands',
    });
  }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
export const getBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch brand',
    });
  }
};

// @desc    Create brand
// @route   POST /api/brands
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create brand',
    });
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update brand',
    });
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
      return;
    }
    
    // Delete logo from Cloudinary if exists
    if (brand.logo) {
      const publicId = brand.logo.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`ecommerce/brands/${publicId}`);
      }
    }
    
    await brand.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete brand',
    });
  }
};