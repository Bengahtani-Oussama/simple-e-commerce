import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../types';

// ============================================
// GET USER CART
// ============================================
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user?.id,
        items: [],
      });
    }

    // Refresh stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.type === 'configurable') {
          const variant = product.variants.find(
            (v) => v._id?.toString() === item.variant.toString()
          );
          if (variant) {
            item.availability = {
              inStock: variant.inventory.stock > 0 && variant.status === 'active',
              currentStock: variant.inventory.stock,
              allowBackorder: variant.inventory.allowBackorder,
            };
          }
        } else {
          // Simple product
          item.availability = {
            inStock: (product.baseInventory?.stock || 0) > 0,
            currentStock: product.baseInventory?.stock || 0,
            allowBackorder: product.baseInventory?.allowBackorder || false,
          };
        }
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get cart',
    });
  }
};

// ============================================
// ADD ITEM TO CART
// ============================================
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId, quantity = 1, selectedAttributes } = req.body;

    // Validate required fields
    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required',
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

    // Check product status
    if (product.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'This product is not available',
      });
      return;
    }

    let variant;
    let sku;
    let price;
    let compareAtPrice;
    let image;
    let stock;
    let allowBackorder;
    let attributes = {};

    if (product.type === 'configurable') {
      // Configurable product - variant required
      if (!variantId) {
        res.status(400).json({
          success: false,
          message: 'Variant ID is required for configurable products',
        });
        return;
      }

      variant = product.variants.find(
        (v) => v._id?.toString() === variantId
      );

      if (!variant) {
        res.status(404).json({
          success: false,
          message: 'Variant not found',
        });
        return;
      }

      if (variant.status !== 'active') {
        res.status(400).json({
          success: false,
          message: 'This variant is not available',
        });
        return;
      }

      sku = variant.sku;
      price = variant.pricing.price;
      compareAtPrice = variant.pricing.compareAtPrice;
      image = variant.images[0] || product.images[0];
      stock = variant.inventory.stock;
      allowBackorder = variant.inventory.allowBackorder;
      
      // Convert Map to plain object for attributes
      attributes = Object.fromEntries(variant.attributes);
    } else {
      // Simple product
      sku = `SIMPLE-${product._id}`;
      price = product.basePricing.price;
      compareAtPrice = product.basePricing.compareAtPrice;
      image = product.images[0];
      stock = product.baseInventory?.stock || 0;
      allowBackorder = product.baseInventory?.allowBackorder || false;
    }

    // Check stock availability
    if (!allowBackorder && stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Only ${stock} items available in stock`,
      });
      return;
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user?.id });
    if (!cart) {
      cart = new Cart({
        user: req.user?.id,
        items: [],
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.sku === sku
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (!allowBackorder && newQuantity > stock) {
        res.status(400).json({
          success: false,
          message: `Only ${stock} items available in stock`,
        });
        return;
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      
      // Update availability
      cart.items[existingItemIndex].availability = {
        inStock: stock > 0,
        currentStock: stock,
        allowBackorder,
      };
    } else {
      // Add new item
      const newItem = {
        product: productId,
        variant: variantId || productId, // Use product ID for simple products
        sku,
        name: product.name,
        selectedAttributes: attributes,
        pricing: {
          price,
          compareAtPrice,
        },
        quantity,
        image,
        availability: {
          inStock: stock > 0,
          currentStock: stock,
          allowBackorder,
        },
        productType: product.type,
      };

      cart.items.push(newItem as any);
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add item to cart',
    });
  }
};

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
      return;
    }

    const cart = await Cart.findOne({ user: req.user?.id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    const item = cart.items.find(
      (item) => item._id?.toString() === req.params.itemId
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    if (product) {
      let currentStock = 0;
      let allowBackorder = false;

      if (product.type === 'configurable') {
        const variant = product.variants.find(
          (v) => v._id?.toString() === item.variant.toString()
        );
        if (variant) {
          currentStock = variant.inventory.stock;
          allowBackorder = variant.inventory.allowBackorder;
        }
      } else {
        currentStock = product.baseInventory?.stock || 0;
        allowBackorder = product.baseInventory?.allowBackorder || false;
      }

      if (!allowBackorder && quantity > currentStock) {
        res.status(400).json({
          success: false,
          message: `Only ${currentStock} items available in stock`,
        });
        return;
      }

      // Update availability
      item.availability = {
        inStock: currentStock > 0,
        currentStock,
        allowBackorder,
      };
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cart',
    });
  }
};

// ============================================
// REMOVE ITEM FROM CART
// ============================================
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id?.toString() !== req.params.itemId
    );

    if (cart.items.length === initialLength) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove item',
    });
  }
};

// ============================================
// CLEAR CART
// ============================================
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear cart',
    });
  }
};

// ============================================
// VALIDATE CART (Check stock before checkout)
// ============================================
export const validateCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id });
    
    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate each item
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        errors.push({
          itemId: item._id,
          sku: item.sku,
          message: 'Product no longer exists',
        });
        continue;
      }

      if (product.status !== 'active') {
        errors.push({
          itemId: item._id,
          sku: item.sku,
          message: 'Product is no longer available',
        });
        continue;
      }

      let currentStock = 0;
      let allowBackorder = false;
      let currentPrice = 0;

      if (product.type === 'configurable') {
        const variant = product.variants.find(
          (v) => v._id?.toString() === item.variant.toString()
        );

        if (!variant) {
          errors.push({
            itemId: item._id,
            sku: item.sku,
            message: 'Variant no longer exists',
          });
          continue;
        }

        if (variant.status !== 'active') {
          errors.push({
            itemId: item._id,
            sku: item.sku,
            message: 'Variant is no longer available',
          });
          continue;
        }

        currentStock = variant.inventory.stock;
        allowBackorder = variant.inventory.allowBackorder;
        currentPrice = variant.pricing.price;
      } else {
        currentStock = product.baseInventory?.stock || 0;
        allowBackorder = product.baseInventory?.allowBackorder || false;
        currentPrice = product.basePricing.price;
      }

      // Check stock
      if (!allowBackorder && item.quantity > currentStock) {
        errors.push({
          itemId: item._id,
          sku: item.sku,
          message: `Only ${currentStock} items available (requested: ${item.quantity})`,
          availableStock: currentStock,
        });
      }

      // Check price changes
      if (currentPrice !== item.pricing.price) {
        warnings.push({
          itemId: item._id,
          sku: item.sku,
          message: 'Price has changed',
          oldPrice: item.pricing.price,
          newPrice: currentPrice,
        });
      }

      // Update item availability
      item.availability = {
        inStock: currentStock > 0,
        currentStock,
        allowBackorder,
      };
    }

    await cart.save();

    const isValid = errors.length === 0;

    res.status(isValid ? 200 : 400).json({
      success: isValid,
      valid: isValid,
      errors,
      warnings,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate cart',
    });
  }
};