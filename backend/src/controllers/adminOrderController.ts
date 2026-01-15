import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail';

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      status,
      paymentStatus,
      hasReturn,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = {};

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (hasReturn !== undefined) filter.hasReturn = hasReturn === 'true';

    // Search by order number or customer name
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search as string, 'i') },
        { 'shippingAddress.fullName': new RegExp(search as string, 'i') },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    // Calculate statistics
    const stats = {
      totalOrders: total,
      pendingOrders: await Order.countDocuments({ orderStatus: 'pending' }),
      confirmedOrders: await Order.countDocuments({ orderStatus: 'confirmed' }),
      shippedOrders: await Order.countDocuments({ orderStatus: 'shipped' }),
      deliveredOrders: await Order.countDocuments({ orderStatus: 'delivered' }),
      cancelledOrders: await Order.countDocuments({ orderStatus: 'cancelled' }),
      ordersWithReturns: await Order.countDocuments({ hasReturn: true }),
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get orders',
    });
  }
};

// @desc    Get single order (Admin)
// @route   GET /api/admin/orders/:id
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone');

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

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderStatus, trackingNumber, estimatedDeliveryDate, adminNote } = req.body;

    const order = await Order.findById(req.params.id).populate('user');
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Update status
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    if (adminNote) order.adminNote = adminNote;

    // Mark as delivered
    if (orderStatus === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid'; // Assume paid on delivery
    }

    await order.save();

    // Send status update email
    try {
      const user = order.user as any;
      await sendEmail({
        to: user.email,
        subject: `Order ${order.orderNumber} - Status Update`,
        html: getOrderStatusUpdateEmail(order, orderStatus, 'ar'),
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status',
    });
  }
};

// @desc    Process item return (Admin)
// @route   PUT /api/admin/orders/:id/items/:itemId/return
export const processReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { returnStatus, returnQuantity, returnReason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Find item using find() instead of id()
    const item = order.items.find(
      (item) => item._id?.toString() === req.params.itemId
    );
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found in order',
      });
      return;
    }

    // Validate return quantity
    if (returnQuantity > item.quantity) {
      res.status(400).json({
        success: false,
        message: 'Return quantity cannot exceed ordered quantity',
      });
      return;
    }

    // Update return status
    item.returnStatus = returnStatus;
    item.returnQuantity = returnQuantity;
    if (returnReason) item.returnReason = returnReason;

    // If return is approved or completed, restore stock
    if (returnStatus === 'approved' || returnStatus === 'completed') {
      await Product.updateOne(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': returnQuantity } }
      );

      // Calculate return total
      const returnAmount = item.price * returnQuantity;
      order.returnTotal += returnAmount;
      order.hasReturn = true;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Return processed successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process return',
    });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/admin/orders/stats
export const getOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    // Total orders and revenue
    const totalOrders = await Order.countDocuments(dateFilter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    // Orders by wilaya (top 10)
    const ordersByWilaya = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$shippingAddress.wilaya', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        ordersByWilaya,
        topProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics',
    });
  }
};

// Email template for status updates
function getOrderStatusUpdateEmail(order: any, status: string, lang: 'ar' | 'en' | 'fr'): string {
  const statusMessages = {
    ar: {
      confirmed: 'تم تأكيد طلبك',
      processing: 'جاري تجهيز طلبك',
      shipped: 'تم شحن طلبك',
      delivered: 'تم توصيل طلبك',
      cancelled: 'تم إلغاء طلبك',
    },
    en: {
      confirmed: 'Your order has been confirmed',
      processing: 'Your order is being processed',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    },
    fr: {
      confirmed: 'Votre commande a été confirmée',
      processing: 'Votre commande est en cours de traitement',
      shipped: 'Votre commande a été expédiée',
      delivered: 'Votre commande a été livrée',
      cancelled: 'Votre commande a été annulée',
    },
  };

  const message = statusMessages[lang][status as keyof typeof statusMessages.ar];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="status">
          <h2>${message}</h2>
          <p>Order #${order.orderNumber}</p>
        </div>
        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
      </div>
    </body>
    </html>
  `;
}

export { getOrderStatusUpdateEmail };