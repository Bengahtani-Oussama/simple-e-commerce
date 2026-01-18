import { Response } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';
import { AuthRequest } from '../types';
import { sendEmail } from '../utils/sendEmail';

// @desc    Create order from cart
// @route   POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shippingAddressId, shippingMethod, shippingCost, customerNote, couponDiscount } = req.body;

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

    // Get shipping address using find() instead of id()
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

    // Validate stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.name.en} not found`,
        });
        return;
      }

      const variant = product.variants.find(
        (v) => v._id?.toString() === item.variant.toString()
      );
      if (!variant || variant.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name.en}`,
        });
        return;
      }
    }

    // Calculate total
    const subtotal = cart.subtotal;
    const total = subtotal + shippingCost - couponDiscount
    // const total = subtotal + shippingCost;

    // Convert cart items to plain objects
    const orderItems = cart.items.map((item) => ({
      product: item.product,
      variant: item.variant,
      sku: item.sku,
      name: item.name,
      variantDetails: item.variantDetails,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      returnStatus: 'none' as const,
      returnQuantity: 0,
    }));

    // Create order
    const order = await Order.create({
      user: req.user?.id,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      orderNumber: Date.now().toString(),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        wilaya: shippingAddress.wilaya,
        commune: shippingAddress.commune,
        addressLine: shippingAddress.addressLine,
        postalCode: shippingAddress.postalCode,
      },
      shippingMethod,
      customerNote,
    });

    // Reduce stock for each variant
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Order Confirmation - Algeria E-Commerce',
        html: getOrderConfirmationEmail(order, user, 'ar'),
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { user: req.user?.id };
    if (status) {
      filter.orderStatus = status;
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

// @desc    Get single order
// @route   GET /api/orders/:id
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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
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
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
      return;
    }

    // Restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': item.quantity } }
      );
    }

    order.orderStatus = 'cancelled';
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

// Email template helper
function getOrderConfirmationEmail(order: any, user: any, lang: 'ar' | 'en' | 'fr'): string {
  const content = {
    ar: {
      title: 'تأكيد الطلب',
      greeting: `مرحباً ${user.firstName}،`,
      message: 'شكراً لطلبك! تم استلام طلبك بنجاح.',
      orderNumber: 'رقم الطلب',
      total: 'المجموع',
      shipping: 'الشحن',
      address: 'عنوان التوصيل',
    },
    en: {
      title: 'Order Confirmation',
      greeting: `Hello ${user.firstName},`,
      message: 'Thank you for your order! Your order has been received successfully.',
      orderNumber: 'Order Number',
      total: 'Total',
      shipping: 'Shipping',
      address: 'Delivery Address',
    },
    fr: {
      title: 'Confirmation de commande',
      greeting: `Bonjour ${user.firstName},`,
      message: 'Merci pour votre commande! Votre commande a été reçue avec succès.',
      orderNumber: 'Numéro de commande',
      total: 'Total',
      shipping: 'Livraison',
      address: 'Adresse de livraison',
    },
  };

  const t = content["en"];
  // const t = content[lang];

  // <html lang="${lang}">
  return `
    <!DOCTYPE html>
    <html lang="${"en"}">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .total { font-size: 20px; font-weight: bold; color: #4F46E5; }
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
            <p><strong>${t.total}:</strong> <span class="total">${order.total} DA</span></p>
            <p><strong>${t.shipping}:</strong> ${order.shippingCost} DA</p>
            <p><strong>${t.address}:</strong><br>
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.addressLine}<br>
            ${order.shippingAddress.commune}, ${order.shippingAddress.wilaya}<br>
            ${order.shippingAddress.phone}
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export { getOrderConfirmationEmail };