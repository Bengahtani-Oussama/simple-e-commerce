import { Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { AuthRequest } from '../types';

// @desc    Get user cart
// @route   GET /api/cart
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user?.id });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user?.id,
        items: [],
        subtotal: 0,
      });
    }

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

// @desc    Add item to cart
// @route   POST /api/cart/items
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    // Find product and variant
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Find variant using find() instead of id()
    const variant = product.variants.find(
      (v) => v._id?.toString() === variantId
    );
    if (!variant) {
      res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
      return;
    }

    // Check if variant is active and in stock
    if (!variant.isActive) {
      res.status(400).json({
        success: false,
        message: 'This variant is not available',
      });
      return;
    }

    if (variant.stock < quantity) {
      res.status(400).json({
        success: false,
        message: `Only ${variant.stock} items available in stock`,
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
      (item) => item.variant.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (newQuantity > variant.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${variant.stock} items available in stock`,
        });
        return;
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variantId,
        sku: variant.sku,
        name: product.name,
        variantDetails: {
          size: variant.size,
          color: variant.color,
          material: variant.material,
          customOptions: variant.customOptions,
        },
        price: variant.price || product.basePrice,
        quantity,
        image: variant.images[0] || product.images[0],
        stock: variant.stock,
      } as any);
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


// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
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

    // Find item using find() instead of id()
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
      const variant = product.variants.find(
        (v) => v._id?.toString() === item.variant.toString()
      );
      if (variant && quantity > variant.stock) {
        res.status(400).json({
          success: false,
          message: `Only ${variant.stock} items available in stock`,
        });
        return;
      }
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
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

    cart.items = cart.items.filter(
      (item) => item._id?.toString() !== req.params.itemId
    );

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

// @desc    Clear cart
// @route   DELETE /api/cart
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