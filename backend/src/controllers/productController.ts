import { Request, Response } from 'express';
import Product from '../models/Product';

// @desc    Get all products with filters
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      subcategory,
      brand,
      featured,
      active,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const filter: any = {};

    // Filters
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (active !== undefined) filter.isActive = active === 'true';

    // Price range
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      filter.$text = { $search: search as string };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name logo')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products',
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name logo');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('brand', 'name logo');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch product',
    });
  }
};

// @desc    Create product
// @route   POST /api/products
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // TODO: Delete all images from Cloudinary

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
};

// @desc    Add variant to product
// @route   POST /api/products/:id/variants
export const addVariant = async (req: Request, res: Response): Promise<void> => {
  try {

        console.log('req body => ', req.body);
        const product = await Product.findById(req.params.id);
        // console.log('product => ', product);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Validate required fields
    if (!req.body.sku || req.body.stock === undefined) {
      res.status(400).json({
        success: false,
        message: 'SKU and stock are required',
      });
      return;
    }

    // Check if SKU already exists
    const skuExists = product.variants.some((v) => v.sku === req.body.sku);
    if (skuExists) {
      res.status(400).json({
        success: false,
        message: 'SKU already exists',
      });
      return;
    }

    // Create variant object explicitly
    const newVariant = {
      sku: req.body.sku,
      size: req.body.size,
      color: req.body.color,
      material: req.body.material,
      customOptions: req.body.customOptions || {},
      price: req.body.price,
      compareAtPrice: req.body.compareAtPrice,
      stock: req.body.stock,
      images: req.body.images || [],
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    };

    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: product,
    });
  } catch (error: any) {
    console.log('error =>', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add variant',
    });
  }
};

// @desc    Update variant
// @route   PUT /api/products/:id/variants/:variantId
export const updateVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Find variant using find() instead of id()
    const variant = product.variants.find(
      (v) => v._id?.toString() === req.params.variantId
    );
    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
      return;
    }

    // Update variant fields
    Object.assign(variant, req.body);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update variant',
    });
  }
};

// @desc    Delete variant
// @route   DELETE /api/products/:id/variants/:variantId
export const deleteVariant = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    product.variants = product.variants.filter(
      (v) => v._id?.toString() !== req.params.variantId
    );

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant deleted successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete variant',
    });
  }
};

// @desc    Check variant stock availability
// @route   GET /api/products/:id/variants/:variantId/stock
export const checkVariantStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Find variant using find() instead of id()
    const variant = product.variants.find(
      (v) => v._id?.toString() === req.params.variantId
    );
    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        sku: variant.sku,
        stock: variant.stock,
        isAvailable: variant.stock > 0 && variant.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check stock',
    });
  }
};