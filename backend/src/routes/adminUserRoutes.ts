// backend/src/routes/adminUserRoutes.ts
import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware';
import User from '../models/User';
import Order from '../models/Order';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

// @desc    Get all customers
// @route   GET /api/admin/customers
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    const filter: any = { role: 'customer' };

    // Search by name or email
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search as string, 'i') },
        { lastName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
      ];
    }

    // Filter by status
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const customers = await User.find(filter)
      .select('-password -refreshToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    // Get customer stats
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ role: 'customer', isActive: true });
    const verifiedCustomers = await User.countDocuments({ role: 'customer', isVerified: true });

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats: {
        totalCustomers,
        activeCustomers,
        verifiedCustomers,
      },
      data: customers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customers',
    });
  }
});

// @desc    Get single customer with order history
// @route   GET /api/admin/customers/:id
router.get('/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select(
      '-password -refreshToken -resetPasswordToken'
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    // Get customer's orders
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate customer statistics
    const totalOrders = await Order.countDocuments({ user: req.params.id });
    const totalSpent = await Order.aggregate([
      { $match: { user: customer._id, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
        stats: {
          totalOrders,
          totalSpent: totalSpent[0]?.total || 0,
          joinedDate: customer.createdAt,
          lastOrder: orders[0]?.createdAt || null,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch customer',
    });
  }
});

// @desc    Toggle customer active status
// @route   PUT /api/admin/customers/:id/toggle-status
router.put('/:id/toggle-status', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    customer.isActive = !customer.isActive;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer ${customer.isActive ? 'activated' : 'deactivated'} successfully`,
      data: customer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update customer status',
    });
  }
});

export default router;