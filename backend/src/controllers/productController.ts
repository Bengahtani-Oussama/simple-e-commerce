import { Request, Response } from "express";
import Product from "../models/Product";
import mongoose from "mongoose";

// ============================================
// GET ALL PRODUCTS
// ============================================
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      category,
      subcategory,
      brand,
      type,
      isFeatured,
      isNewProduct,
      status,
      minPrice,
      maxPrice,
      search,
      tags,
      inStock,
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = req.query;

    const filter: any = {};

    // Type filter
    if (type) filter.type = type;

    // Categorization filters
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = brand;

    // Flag filters
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isNewProduct !== undefined)
      filter.isNewProduct = isNewProduct === "true";
    if (status) filter.status = status;

    // Price range filter (searches in variants)
    if (minPrice || maxPrice) {
      filter["variants.pricing.price"] = {};
      if (minPrice) filter["variants.pricing.price"].$gte = Number(minPrice);
      if (maxPrice) filter["variants.pricing.price"].$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === "true") {
      filter.$or = [
        // Configurable products with stock
        {
          type: "configurable",
          "variants.inventory.stock": { $gt: 0 },
          "variants.status": "active",
        },
        // Simple products with stock
        {
          type: "simple",
          "baseInventory.stock": { $gt: 0 },
        },
      ];
    }

    // Search in product names
    if (search) {
      filter.$or = [
        { "name.ar": new RegExp(search as string, "i") },
        { "name.en": new RegExp(search as string, "i") },
        { "name.fr": new RegExp(search as string, "i") },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = (tags as string).split(",");
      filter.tags = { $in: tagArray };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("brand", "name logo")
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .lean();

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
      message: error.message || "Failed to fetch products",
    });
  }
};

// ============================================
// GET SINGLE PRODUCT BY ID
// ============================================
export const getProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("brand", "name logo")
      .populate("relatedProducts", "name slug images basePricing type variants")
      .populate("upsellProducts", "name slug images basePricing type variants")
      .populate(
        "crossSellProducts",
        "name slug images basePricing type variants",
      );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Increment view count
    product.stats.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// ============================================
// GET PRODUCT BY SLUG
// ============================================
export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .populate("brand", "name logo")
      .populate("relatedProducts", "name slug images basePricing type variants")
      .populate("upsellProducts", "name slug images basePricing type variants")
      .populate(
        "crossSellProducts",
        "name slug images basePricing type variants",
      );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Increment view count
    product.stats.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productData = req.body;
    // console.log('productData', productData)
    console.log("productData type : => ", productData.type);
    // Validate product type
    
    console.log('ERROR Create Prod');
    if (productData.type === "configurable") {
      console.log("------ productData is configurable ----- ");
      
      if (!productData.options || productData.options.length === 0) {
        console.log("------ productData is not have options ----- ");
        res.status(400).json({
          success: false,
          message: "Configurable products must have at least one option",
        });
        return;
      }
      if (!productData.variants || productData.variants.length === 0) {
        console.log("------ productData is not have variants ----- ");
        res.status(400).json({
          success: false,
          message: "Configurable products must have at least one variant",
        });
        return;
      }
    }
    console.log('Create Prod');

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ============================================
// DELETE PRODUCT
// ============================================
export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // TODO: Check if product is in any active orders
    // TODO: Delete all images from Cloudinary

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

// ============================================
// ADD VARIANT TO PRODUCT
// ============================================
export const addVariant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.type !== "configurable") {
      res.status(400).json({
        success: false,
        message: "Cannot add variants to simple products",
      });
      return;
    }

    // Validate required fields
    if (!req.body.sku) {
      res.status(400).json({
        success: false,
        message: "SKU is required",
      });
      return;
    }

    if (!req.body.attributes) {
      res.status(400).json({
        success: false,
        message: "Variant attributes are required",
      });
      return;
    }

    if (!req.body.pricing || req.body.pricing.price === undefined) {
      res.status(400).json({
        success: false,
        message: "Variant pricing is required",
      });
      return;
    }

    // Check if SKU already exists (across all products)
    const existingProduct = await Product.findOne({
      "variants.sku": req.body.sku,
    });

    if (existingProduct) {
      res.status(400).json({
        success: false,
        message: "SKU already exists",
      });
      return;
    }

    // Create variant object
    const newVariant = {
      sku: req.body.sku,
      attributes: req.body.attributes,
      pricing: {
        price: req.body.pricing.price,
        compareAtPrice: req.body.pricing.compareAtPrice,
        cost: req.body.pricing.cost,
      },
      inventory: {
        stock: req.body.inventory?.stock || 0,
        trackInventory: req.body.inventory?.trackInventory !== false,
        allowBackorder: req.body.inventory?.allowBackorder || false,
        lowStockThreshold: req.body.inventory?.lowStockThreshold,
      },
      images: req.body.images || [],
      physical: req.body.physical,
      status: req.body.status || "active",
      seo: req.body.seo,
    };

    product.variants.push(newVariant);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Variant added successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to add variant",
    });
  }
};

// ============================================
// UPDATE VARIANT
// ============================================
export const updateVariant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const variant = product.variants.find(
      (v) => v._id?.toString() === req.params.variantId,
    );

    if (!variant) {
      res.status(404).json({
        success: false,
        message: "Variant not found",
      });
      return;
    }

    // Update variant fields
    if (req.body.sku) variant.sku = req.body.sku;
    if (req.body.attributes) variant.attributes = req.body.attributes;
    if (req.body.pricing) {
      variant.pricing = {
        ...variant.pricing,
        ...req.body.pricing,
      };
    }
    if (req.body.inventory) {
      variant.inventory = {
        ...variant.inventory,
        ...req.body.inventory,
      };
    }
    if (req.body.images) variant.images = req.body.images;
    if (req.body.physical) variant.physical = req.body.physical;
    if (req.body.status) variant.status = req.body.status;
    if (req.body.seo) variant.seo = req.body.seo;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update variant",
    });
  }
};

// ============================================
// DELETE VARIANT
// ============================================
export const deleteVariant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Don't allow deleting the last variant
    if (product.variants.length === 1) {
      res.status(400).json({
        success: false,
        message:
          "Cannot delete the last variant. Product must have at least one variant.",
      });
      return;
    }

    product.variants = product.variants.filter(
      (v) => v._id?.toString() !== req.params.variantId,
    );

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete variant",
    });
  }
};

// ============================================
// CHECK VARIANT STOCK
// ============================================
export const checkVariantStock = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const variant = product.variants.find(
      (v) => v._id?.toString() === req.params.variantId,
    );

    if (!variant) {
      res.status(404).json({
        success: false,
        message: "Variant not found",
      });
      return;
    }

    const isAvailable =
      variant.inventory.stock > 0 && variant.status === "active";

    const isLowStock = variant.inventory.lowStockThreshold
      ? variant.inventory.stock <= variant.inventory.lowStockThreshold
      : false;

    res.status(200).json({
      success: true,
      data: {
        sku: variant.sku,
        stock: variant.inventory.stock,
        isAvailable,
        isLowStock,
        allowBackorder: variant.inventory.allowBackorder,
        trackInventory: variant.inventory.trackInventory,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check stock",
    });
  }
};

// ============================================
// GET VARIANT BY ATTRIBUTES
// ============================================
export const getVariantByAttributes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.type !== "configurable") {
      res.status(400).json({
        success: false,
        message: "This endpoint is only for configurable products",
      });
      return;
    }

    const { attributes } = req.body;

    if (!attributes) {
      res.status(400).json({
        success: false,
        message: "Attributes are required",
      });
      return;
    }

    // Use the product method to find variant
    const variant = product.findVariantByAttributes(attributes);

    if (!variant) {
      res.status(404).json({
        success: false,
        message: "No variant found with the specified attributes",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to find variant",
    });
  }
};

// ============================================
// GET AVAILABLE OPTIONS
// ============================================
export const getAvailableOptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.type !== "configurable") {
      res.status(400).json({
        success: false,
        message: "This endpoint is only for configurable products",
      });
      return;
    }

    const { optionCode, selectedAttributes } = req.query;

    if (!optionCode) {
      res.status(400).json({
        success: false,
        message: "optionCode is required",
      });
      return;
    }

    let selectedAttrs = {};
    if (selectedAttributes) {
      try {
        selectedAttrs = JSON.parse(selectedAttributes as string);
      } catch (e) {
        res.status(400).json({
          success: false,
          message: "Invalid selectedAttributes format",
        });
        return;
      }
    }

    const availableOptions = product.getAvailableOptions(
      optionCode as string,
      selectedAttrs,
    );

    res.status(200).json({
      success: true,
      data: availableOptions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get available options",
    });
  }
};

// ============================================
// UPDATE PRODUCT OPTIONS
// ============================================
export const updateProductOptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (product.type !== "configurable") {
      res.status(400).json({
        success: false,
        message: "Cannot update options for simple products",
      });
      return;
    }

    if (!req.body.options || !Array.isArray(req.body.options)) {
      res.status(400).json({
        success: false,
        message: "Options array is required",
      });
      return;
    }

    product.options = req.body.options;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product options updated successfully",
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update options",
    });
  }
};
