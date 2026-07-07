import { Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import Coupon from '../models/Coupon';
import { AuthRequest } from '../types';
import { sendEmail } from '../utils/sendEmail';

// ============================================
// CREATE ORDER FROM CART
// ============================================
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      shippingAddressId, 
      shippingMethod, 
      shippingCost, 
      customerNote, 
      couponCode
    } = req.body;

    // Validate shipping cost
    const shippingCostNum = Number(shippingCost);
    if (isNaN(shippingCostNum) || shippingCostNum < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid shipping cost',
      });
      return;
    }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user?.id });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
      return;
    }

    // Get user
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get shipping address
    const shippingAddress = user.addresses.find(
      (addr) => addr._id?.toString() === shippingAddressId
    );
    if (!shippingAddress) {
      res.status(404).json({
        success: false,
        message: 'Shipping address not found',
      });
      return;
    }

    // ============================================
    // VALIDATE STOCK FOR ALL ITEMS
    // ============================================
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.name.en} not found`,
        });
        return;
      }

      if (product.status !== 'active') {
        res.status(400).json({
          success: false,
          message: `Product ${item.name.en} is not available`,
        });
        return;
      }

      if (product.type === 'configurable') {
        const variant = product.variants.find(
          (v) => v._id?.toString() === item.variant.toString()
        );

        if (!variant) {
          res.status(404).json({
            success: false,
            message: `Variant for ${item.name.en} not found`,
          });
          return;
        }

        if (variant.status !== 'active') {
          res.status(400).json({
            success: false,
            message: `Variant for ${item.name.en} is not available`,
          });
          return;
        }

        // Check stock
        if (!variant.inventory.allowBackorder && variant.inventory.stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.name.en}. Available: ${variant.inventory.stock}`,
          });
          return;
        }
      } else {
        // Simple product
        const stock = product.baseInventory?.stock || 0;
        const allowBackorder = product.baseInventory?.allowBackorder || false;

        if (!allowBackorder && stock < item.quantity) {
          res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.name.en}. Available: ${stock}`,
          });
          return;
        }
      }
    }

    // ============================================
    // CALCULATE PRICING
    // ============================================
    const subtotal = cart.summary.subtotal;
    let couponDiscount = 0;
    let couponData = null;
    let finalShippingCost = shippingCostNum;

    // ============================================
    // VALIDATE AND APPLY COUPON
    // ============================================
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

      if (!coupon) {
        res.status(404).json({
          success: false,
          message: 'Invalid coupon code',
        });
        return;
      }

      // Check customer usage count
      const customerUsageCount = await Order.countDocuments({
        user: req.user?.id,
        'coupon.code': coupon.code,
      });

      // Validate coupon
      const validation = coupon.validateForOrder(
        subtotal,
        req.user?.id as string,
        customerUsageCount
      );

      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: validation.reason,
        });
        return;
      }

      // Calculate discount
      const discountResult = coupon.calculateDiscount(subtotal, shippingCostNum);
      couponDiscount = discountResult.discount;

      // Apply free shipping if applicable
      if (discountResult.freeShipping) {
        finalShippingCost = 0;
      }

      // Prepare coupon data for order
      couponData = {
        code: coupon.code,
        type: coupon.type,
        discount: couponDiscount,
        freeShipping: discountResult.freeShipping,
      };

      // Increment coupon usage count
      coupon.usedCount += 1;
      await coupon.save();
    }

    // ============================================
    // CALCULATE TOTAL
    // ============================================
    const total = subtotal + finalShippingCost - couponDiscount;

    // ============================================
    // PREPARE ORDER ITEMS
    // ============================================
    const orderItems = cart.items.map((item) => ({
      product: item.product,
      variant: item.variant,
      sku: item.sku,
      name: item.name,
      selectedAttributes: Object.fromEntries(Object.entries(item.selectedAttributes)),
      pricing: {
        price: item.pricing.price,
        compareAtPrice: item.pricing.compareAtPrice,
      },
      quantity: item.quantity,
      image: item.image,
      productType: item.productType,
      returnInfo: {
        status: 'none' as const,
        quantity: 0,
      },
    }));

    // ============================================
    // CREATE ORDER
    // ============================================
    const order = await Order.create({
      user: req.user?.id,
      items: orderItems,
      pricing: {
        subtotal,
        shippingCost: finalShippingCost,
        couponDiscount,
        total,
      },
      shipping: {
        address: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          wilaya: shippingAddress.wilaya,
          commune: shippingAddress.commune,
          addressLine: shippingAddress.addressLine,
          postalCode: shippingAddress.postalCode,
        },
        method: shippingMethod,
      },
      payment: {
        method: 'cash_on_delivery',
        status: 'pending',
      },
      status: {
        current: 'pending',
        history: [],
      },
      notes: {
        customer: customerNote,
      },
      returns: {
        hasReturn: false,
        totalRefund: 0,
        items: [],
      },
      coupon: couponData,
    });

    // ============================================
    // REDUCE STOCK FOR EACH ITEM
    // ============================================
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.type === 'configurable') {
          const variantIndex = product.variants.findIndex(
            (v) => v._id?.toString() === item.variant.toString()
          );

          if (variantIndex !== -1 && product.variants[variantIndex].inventory.trackInventory) {
            product.variants[variantIndex].inventory.stock -= item.quantity;
            
            // Update status if out of stock
            if (product.variants[variantIndex].inventory.stock <= 0) {
              product.variants[variantIndex].status = 'out_of_stock';
            }
          }
        } else {
          // Simple product
          if (product.baseInventory?.trackInventory) {
            product.baseInventory.stock -= item.quantity;
          }
        }

        // Update sold count
        product.stats.soldCount += item.quantity;
        await product.save();
      }
    }

    // ============================================
    // CLEAR CART
    // ============================================
    cart.items = [];
    await cart.save();

    // ============================================
    // SEND ORDER CONFIRMATION EMAIL
    // ============================================
    try {
      await sendEmail({
        to: user.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: getOrderConfirmationEmail(order, user, 'ar'),
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

// ============================================
// GET USER ORDERS
// ============================================
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { user: req.user?.id };
    if (status) {
      filter['status.current'] = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get orders',
    });
  }
};

// ============================================
// GET SINGLE ORDER
// ============================================
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get order',
    });
  }
};

// ============================================
// APPLY COUPON TO ORDER
// ============================================
export const applyCouponToOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
      return;
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Only allow coupon application if order is pending
    if (order.status.current !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Coupon can only be applied to pending orders',
      });
      return;
    }

    // Check if coupon is already applied
    if (order.coupon) {
      res.status(400).json({
        success: false,
        message: 'A coupon is already applied to this order',
      });
      return;
    }

    // Find and validate coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
      return;
    }

    // Check customer usage count
    const customerUsageCount = await Order.countDocuments({
      user: req.user?.id,
      'coupon.code': coupon.code,
    });

    // Validate coupon
    const validation = coupon.validateForOrder(
      order.pricing.subtotal,
      req.user?.id as string,
      customerUsageCount
    );

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: validation.reason,
      });
      return;
    }

    // Calculate discount
    const { discount, freeShipping } = coupon.calculateDiscount(
      order.pricing.subtotal,
      order.pricing.shippingCost
    );

    // Apply coupon to order
    order.coupon = {
      code: coupon.code,
      type: coupon.type,
      discount,
      freeShipping,
    };
    order.pricing.couponDiscount = discount;

    // Handle free shipping
    if (freeShipping) {
      order.pricing.shippingCost = 0;
    }

    // Recalculate total
    order.pricing.total = 
      order.pricing.subtotal + 
      order.pricing.shippingCost - 
      order.pricing.couponDiscount;

    await order.save();

    // Increment coupon usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
};

// ============================================
// CANCEL ORDER
// ============================================
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status.current)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
      return;
    }

    // ============================================
    // RESTORE STOCK FOR EACH ITEM
    // ============================================
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.type === 'configurable') {
          const variantIndex = product.variants.findIndex(
            (v) => v._id?.toString() === item.variant.toString()
          );

          if (variantIndex !== -1 && product.variants[variantIndex].inventory.trackInventory) {
            product.variants[variantIndex].inventory.stock += item.quantity;
            
            // Restore status if it was out of stock
            if (product.variants[variantIndex].status === 'out_of_stock') {
              product.variants[variantIndex].status = 'active';
            }
          }
        } else {
          // Simple product
          if (product.baseInventory?.trackInventory) {
            product.baseInventory.stock += item.quantity;
          }
        }

        // Update sold count
        product.stats.soldCount = Math.max(0, product.stats.soldCount - item.quantity);
        await product.save();
      }
    }

    // Update order status
    order.updateStatus('cancelled', 'Cancelled by customer');
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  }
};

// ============================================
// REQUEST ITEM RETURN
// ============================================
export const requestReturn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId, quantity, reason } = req.body;

    if (!itemId || !quantity || !reason) {
      res.status(400).json({
        success: false,
        message: 'Item ID, quantity, and reason are required',
      });
      return;
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Only allow returns for delivered orders
    if (order.status.current !== 'delivered') {
      res.status(400).json({
        success: false,
        message: 'Returns can only be requested for delivered orders',
      });
      return;
    }

    // const item = order.items.id(itemId);
    const itemIndex = order.items.findIndex(
      (item) => item?._id?.toString() === itemId,
    );
    if (itemIndex === -1) {
      // Item not found in order
      res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
      return;
    }

    const item = order.items[itemIndex];
    if (!item || !item._id) {
      // Item or _id not found in order
      res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
      return;
    }
    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
      return;
    }
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found in order',
      });
      return;
    }

    // Check if return already requested
    if (item.returnInfo && item.returnInfo.status !== 'none') {
      res.status(400).json({
        success: false,
        message: 'Return already requested for this item',
      });
      return;
    }

    // Validate quantity
    if (quantity > item.quantity) {
      res.status(400).json({
        success: false,
        message: 'Return quantity cannot exceed ordered quantity',
      });
      return;
    }

    // Update item return info
    item.returnInfo = {
      status: 'requested',
      quantity,
      reason,
      requestedAt: new Date(),
    };

    order.returns.hasReturn = true;
    if (!order.returns.items.includes(itemId)) {
      order.returns.items.push(itemId);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return requested successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to request return',
    });
  }
};

// ============================================
// EMAIL TEMPLATE HELPER
// ============================================
function getOrderConfirmationEmail(order: any, user: any, lang: 'ar' | 'en' | 'fr'): string {
  const content = {
    ar: {
      title: 'تأكيد الطلب',
      greeting: `مرحباً ${user.firstName}،`,
      message: 'شكراً لطلبك! تم استلام طلبك بنجاح.',
      orderNumber: 'رقم الطلب',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      coupon: 'خصم القسيمة',
      total: 'المجموع',
      address: 'عنوان التوصيل',
    },
    en: {
      title: 'Order Confirmation',
      greeting: `Hello ${user.firstName},`,
      message: 'Thank you for your order! Your order has been received successfully.',
      orderNumber: 'Order Number',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      coupon: 'Coupon Discount',
      total: 'Total',
      address: 'Delivery Address',
    },
    fr: {
      title: 'Confirmation de commande',
      greeting: `Bonjour ${user.firstName},`,
      message: 'Merci pour votre commande! Votre commande a été reçue avec succès.',
      orderNumber: 'Numéro de commande',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      coupon: 'Réduction coupon',
      total: 'Total',
      address: 'Adresse de livraison',
    },
  };

  const t = content[lang];

  return `
    <!DOCTYPE html>
    <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .total { font-size: 20px; font-weight: bold; color: #4F46E5; }
          .coupon { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${t.title}</h2>
          </div>
          <div class="content">
            <p>${t.greeting}</p>
            <p>${t.message}</p>
            <div class="order-info">
              <p><strong>${t.orderNumber}:</strong> ${order.orderNumber}</p>
              <p><strong>${t.subtotal}:</strong> ${order.pricing.subtotal} DA</p>
              <p><strong>${t.shipping}:</strong> ${order.pricing.shippingCost} DA</p>
              ${order.coupon ? `<p class="coupon"><strong>${t.coupon} (${order.coupon.code}):</strong> -${order.pricing.couponDiscount} DA</p>` : ''}
              <p><strong>${t.total}:</strong> <span class="total">${order.pricing.total} DA</span></p>
              <p><strong>${t.address}:</strong><br>
              ${order.shipping.address.fullName}<br>
              ${order.shipping.address.addressLine}<br>
              ${order.shipping.address.commune}, ${order.shipping.address.wilaya}<br>
              ${order.shipping.address.phone}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export { getOrderConfirmationEmail };