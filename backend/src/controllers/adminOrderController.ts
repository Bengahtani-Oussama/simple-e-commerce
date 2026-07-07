import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { sendEmail } from "../utils/sendEmail";
import { AuthRequest } from "../types";

// ============================================
// GET ALL ORDERS (ADMIN)
// ============================================
export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      status,
      paymentStatus,
      hasReturn,
      search,
      startDate,
      endDate,
      wilaya,
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = {};

    if (status) filter["status.current"] = status;
    if (paymentStatus) filter["payment.status"] = paymentStatus;
    if (hasReturn !== undefined)
      filter["returns.hasReturn"] = hasReturn === "true";
    if (wilaya) filter["shipping.address.wilaya"] = wilaya;

    // Search by order number or customer name
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search as string, "i") },
        { "shipping.address.fullName": new RegExp(search as string, "i") },
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
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    // Calculate statistics
    const stats = {
      totalOrders: total,
      pendingOrders: await Order.countDocuments({
        "status.current": "pending",
      }),
      confirmedOrders: await Order.countDocuments({
        "status.current": "confirmed",
      }),
      processingOrders: await Order.countDocuments({
        "status.current": "processing",
      }),
      shippedOrders: await Order.countDocuments({
        "status.current": "shipped",
      }),
      deliveredOrders: await Order.countDocuments({
        "status.current": "delivered",
      }),
      cancelledOrders: await Order.countDocuments({
        "status.current": "cancelled",
      }),
      ordersWithReturns: await Order.countDocuments({
        "returns.hasReturn": true,
      }),
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
      message: error.message || "Failed to get orders",
    });
  }
};

// ============================================
// GET SINGLE ORDER (ADMIN)
// ============================================
export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email phone")
      .populate({
        path: "status.history.updatedBy",
        select: "name email",
      });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
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
      message: error.message || "Failed to get order",
    });
  }
};

// ============================================
// UPDATE ORDER STATUS (ADMIN)
// ============================================
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { orderStatus, trackingNumber, estimatedDeliveryDate, adminNote } =
      req.body;

    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Update status using the model method
    if (orderStatus) {
      order.updateStatus(orderStatus, adminNote, req.user?.id);
    }

    // Update tracking info
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
    if (estimatedDeliveryDate) {
      order.shipping.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }
    if (adminNote) order.notes.admin = adminNote;

    await order.save();

    // Send status update email
    try {
      const user = order.user as any;
      await sendEmail({
        to: user.email,
        subject: `Order ${order.orderNumber} - Status Update`,
        html: getOrderStatusUpdateEmail(order, orderStatus, "ar"),
      });
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

// ============================================
// PROCESS ITEM RETURN (ADMIN)
// ============================================
export const processReturn = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { returnStatus, returnQuantity, adminNote } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // const item = order.items.id(req.params.itemId);

    const itemId = req.params.itemId;
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

    // Validate return quantity
    const requestedQuantity = item.returnInfo?.quantity || 0;
    const quantityToProcess = returnQuantity || requestedQuantity;

    if (quantityToProcess > item.quantity) {
      res.status(400).json({
        success: false,
        message: "Return quantity cannot exceed ordered quantity",
      });
      return;
    }

    // Update return status
    if (!item.returnInfo) {
      item.returnInfo = {
        status: "none",
        quantity: 0,
      };
    }

    item.returnInfo.status = returnStatus;
    item.returnInfo.quantity = quantityToProcess;
    item.returnInfo.processedAt = new Date();

    // If return is approved or completed, restore stock and calculate refund
    if (returnStatus === "approved" || returnStatus === "completed") {
      const product = await Product.findById(item.product);

      if (product) {
        if (product.type === "configurable") {
          const variantIndex = product.variants.findIndex(
            (v) => v._id?.toString() === item.variant.toString(),
          );

          if (
            variantIndex !== -1 &&
            product.variants[variantIndex].inventory.trackInventory
          ) {
            product.variants[variantIndex].inventory.stock += quantityToProcess;

            // Restore status if it was out of stock
            if (product.variants[variantIndex].status === "out_of_stock") {
              product.variants[variantIndex].status = "active";
            }
          }
        } else {
          // Simple product
          if (product.baseInventory?.trackInventory) {
            product.baseInventory.stock += quantityToProcess;
          }
        }

        await product.save();
      }

      // Calculate return total
      const returnAmount = item.pricing.price * quantityToProcess;
      order.returns.totalRefund += returnAmount;
      order.returns.hasReturn = true;

      if (!order.returns.items.includes(req.params.itemId as any)) {
        order.returns.items.push(req.params.itemId as any);
      }
    }

    // Add admin note
    if (adminNote) {
      order.notes.internal =
        (order.notes.internal || "") + `\n[Return] ${adminNote}`;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return processed successfully",
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process return",
    });
  }
};

// ============================================
// GET ORDER STATISTICS (ADMIN)
// ============================================
export const getOrderStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    const revenueData = await Order.aggregate([
      { $match: { ...dateFilter, "status.current": { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$pricing.total" },
          subtotal: { $sum: "$pricing.subtotal" },
          shipping: { $sum: "$pricing.shippingCost" },
          discounts: { $sum: "$pricing.couponDiscount" },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status.current", count: { $sum: 1 } } },
    ]);

    // Orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$payment.status", count: { $sum: 1 } } },
    ]);

    // Orders by wilaya (top 10)
    const ordersByWilaya = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$shipping.address.wilaya", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Orders by shipping method
    const ordersByShippingMethod = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$shipping.method", count: { $sum: 1 } } },
    ]);

    // Top selling products (by variant)
    const topProducts = await Order.aggregate([
      { $match: { ...dateFilter, "status.current": { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.sku",
          productName: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: {
            $sum: { $multiply: ["$items.pricing.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Average order value
    const avgOrderValue = await Order.aggregate([
      { $match: { ...dateFilter, "status.current": { $ne: "cancelled" } } },
      { $group: { _id: null, avg: { $avg: "$pricing.total" } } },
    ]);

    // Orders over time (daily)
    const ordersOverTime = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue: revenueData[0]?.total || 0,
          totalSubtotal: revenueData[0]?.subtotal || 0,
          totalShipping: revenueData[0]?.shipping || 0,
          totalDiscounts: revenueData[0]?.discounts || 0,
          averageOrderValue: avgOrderValue[0]?.avg || 0,
        },
        ordersByStatus,
        ordersByPaymentStatus,
        ordersByWilaya,
        ordersByShippingMethod,
        topProducts,
        ordersOverTime,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get statistics",
    });
  }
};

// ============================================
// BULK UPDATE ORDERS
// ============================================
export const bulkUpdateOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { orderIds, status, adminNote } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: "Order IDs array is required",
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Status is required",
      });
      return;
    }

    const results = [];
    const errors = [];

    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId);
        if (!order) {
          errors.push({ orderId, error: "Order not found" });
          continue;
        }

        order.updateStatus(status, adminNote, req.user?.id);
        await order.save();

        results.push({ orderId, orderNumber: order.orderNumber });
      } catch (error: any) {
        errors.push({ orderId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} orders updated successfully`,
      data: {
        successful: results,
        failed: errors,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk update orders",
    });
  }
};

// ============================================
// GET RETURN REQUESTS
// ============================================
export const getReturnRequests = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter: any = { "returns.hasReturn": true };

    if (status && status !== "all") {
      filter["items.returnInfo.status"] = status;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email phone")
      .sort({ "items.returnInfo.requestedAt": -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    // Extract only items with return requests
    const returnRequests = orders.flatMap((order) =>
      order.items
        .filter((item) => item.returnInfo && item.returnInfo.status !== "none")
        .map((item) => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemId: item._id,
          item,
          customer: order.user,
          requestedAt: item.returnInfo?.requestedAt,
          status: item.returnInfo?.status,
        })),
    );

    res.status(200).json({
      success: true,
      count: returnRequests.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: returnRequests,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get return requests",
    });
  }
};

// ============================================
// EMAIL TEMPLATE FOR STATUS UPDATES
// ============================================
function getOrderStatusUpdateEmail(
  order: any,
  status: string,
  lang: "ar" | "en" | "fr",
): string {
  const statusMessages = {
    ar: {
      confirmed: "تم تأكيد طلبك",
      processing: "جاري تجهيز طلبك",
      shipped: "تم شحن طلبك",
      delivered: "تم توصيل طلبك",
      cancelled: "تم إلغاء طلبك",
    },
    en: {
      confirmed: "Your order has been confirmed",
      processing: "Your order is being processed",
      shipped: "Your order has been shipped",
      delivered: "Your order has been delivered",
      cancelled: "Your order has been cancelled",
    },
    fr: {
      confirmed: "Votre commande a été confirmée",
      processing: "Votre commande est en cours de traitement",
      shipped: "Votre commande a été expédiée",
      delivered: "Votre commande a été livrée",
      cancelled: "Votre commande a été annulée",
    },
  };

  const message =
    statusMessages[lang][status as keyof typeof statusMessages.ar];

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
        ${order.shipping.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.shipping.trackingNumber}</p>` : ""}
        ${order.shipping.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.shipping.estimatedDeliveryDate).toLocaleDateString()}</p>` : ""}
      </div>
    </body>
    </html>
  `;
}

export { getOrderStatusUpdateEmail };
