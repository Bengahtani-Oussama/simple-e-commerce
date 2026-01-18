// backend/src/controllers/couponController.ts
import { Request, Response } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';
import { AuthRequest } from '../types';

// @desc    Get all coupons (with filters)
// @route   GET /api/admin/coupons
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      type,
      status, // active, expired, inactive, all
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const filter: any = {};

    // Search by code or description
    if (search) {
      filter.$or = [
        { code: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') },
      ];
    }

    // Filter by type
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Filter by status
    if (status === 'active') {
      filter.isActive = true;
      filter.$or = [
        { endDate: { $gte: new Date() } },
        { endDate: null },
      ];
    } else if (status === 'expired') {
      filter.endDate = { $lt: new Date() };
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum);

    const total = await Coupon.countDocuments(filter);

    // Calculate statistics
    const stats = {
      totalCoupons: await Coupon.countDocuments(),
      activeCoupons: await Coupon.countDocuments({
        isActive: true,
        $or: [{ endDate: { $gte: new Date() } }, { endDate: null }],
      }),
      expiredCoupons: await Coupon.countDocuments({
        endDate: { $lt: new Date() },
      }),
      usedCoupons: await Coupon.countDocuments({ usedCount: { $gt: 0 } }),
    };

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats,
      data: coupons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coupons',
    });
  }
};

// @desc    Get single coupon
// @route   GET /api/admin/coupons/:id
export const getCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
      return;
    }

    // Get usage statistics
    const ordersWithCoupon = await Order.countDocuments({
      'coupon.code': coupon.code,
    });

    const totalDiscountGiven = await Order.aggregate([
      { $match: { 'coupon.code': coupon.code } },
      { $group: { _id: null, total: { $sum: '$coupon.discount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        coupon,
        usage: {
          timesUsed: ordersWithCoupon,
          totalDiscountGiven: totalDiscountGiven[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coupon',
    });
  }
};

// @desc    Create coupon
// @route   POST /api/admin/coupons
export const createCoupon = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user?.id,
    };

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error: any) {
    // Handle duplicate code error
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create coupon',
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update coupon',
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
      return;
    }

    // Check if coupon has been used
    const usageCount = await Order.countDocuments({
      'coupon.code': coupon.code,
    });

    if (usageCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete coupon that has been used ${usageCount} time(s). Consider deactivating instead.`,
      });
      return;
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete coupon',
    });
  }
};

// @desc    Toggle coupon active status
// @route   PUT /api/admin/coupons/:id/toggle-status
export const toggleCouponStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
      return;
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: coupon,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle coupon status',
    });
  }
};

// @desc    Validate coupon (for customer use)
// @route   POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderSubtotal, shippingCost, userId } = req.body;

    if (!code || orderSubtotal === undefined) {
      res.status(400).json({
        success: false,
        message: 'Coupon code and order subtotal are required',
      });
      return;
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: 'Invalid coupon code',
      });
      return;
    }

    // Check customer usage count
    let customerUsageCount = 0;
    if (userId) {
      customerUsageCount = await Order.countDocuments({
        user: userId,
        'coupon.code': coupon.code,
      });
    }

    // Validate coupon
    const validation = coupon.validateForOrder(
      orderSubtotal,
      userId,
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
      orderSubtotal,
      shippingCost || 0
    );

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        type: coupon.type,
        discount,
        freeShipping,
        description: coupon.description,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate coupon',
    });
  }
};