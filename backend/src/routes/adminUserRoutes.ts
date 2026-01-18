// backend/src/routes/adminUserRoutes.ts
import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware';
import User from '../models/User';
import Order from '../models/Order';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

// @desc    Get all customers with advanced filters
// @route   GET /api/admin/customers
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      status, 
      minSpent, 
      maxSpent,
      startDate,
      endDate,
      page = 1, 
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const filter: any = { role: 'customer' };

    // Search by name or email
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search as string, 'i') },
        { lastName: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') },
        { phone: new RegExp(search as string, 'i') },
      ];
    }

    // Filter by status
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'verified') filter.isVerified = true;
    if (status === 'unverified') filter.isVerified = false;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get customers
    let customers = await User.find(filter)
      .select('-password -refreshToken -resetPasswordToken')
      .sort(sort as string)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate total spent for each customer (for filtering)
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orderStats = await Order.aggregate([
          { 
            $match: { 
              user: customer._id, 
              orderStatus: { $ne: 'cancelled' } 
            } 
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$total' },
              totalOrders: { $sum: 1 },
            },
          },
        ]);

        const stats = orderStats[0] || { totalSpent: 0, totalOrders: 0 };

        return {
          ...customer,
          totalSpent: stats.totalSpent,
          totalOrders: stats.totalOrders,
        };
      })
    );

    // Apply spending filters AFTER calculating stats
    let filteredCustomers = customersWithStats;
    if (minSpent) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.totalSpent >= Number(minSpent)
      );
    }
    if (maxSpent) {
      filteredCustomers = filteredCustomers.filter(
        (c) => c.totalSpent <= Number(maxSpent)
      );
    }

    const total = await User.countDocuments(filter);

    // Get overall stats
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ 
      role: 'customer', 
      isActive: true 
    });
    const verifiedCustomers = await User.countDocuments({ 
      role: 'customer', 
      isVerified: true 
    });

    res.status(200).json({
      success: true,
      count: filteredCustomers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      stats: {
        totalCustomers,
        activeCustomers,
        verifiedCustomers,
      },
      data: filteredCustomers,
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
    
    const spentStats = await Order.aggregate([
      { 
        $match: { 
          user: customer._id, 
          orderStatus: { $ne: 'cancelled' } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$total' } 
        } 
      },
    ]);

    const lastOrder = await Order.findOne({ user: req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
        stats: {
          totalOrders,
          totalSpent: spentStats[0]?.total || 0,
          joinedDate: customer.createdAt,
          lastOrder: lastOrder?.createdAt || null,
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

// @desc    Bulk toggle customer status
// @route   PUT /api/admin/customers/bulk/toggle-status
router.put('/bulk/toggle-status', async (req, res) => {
  try {
    const { customerIds, isActive } = req.body;

    if (!customerIds || !Array.isArray(customerIds)) {
      res.status(400).json({
        success: false,
        message: 'Please provide an array of customer IDs',
      });
      return;
    }

    const result = await User.updateMany(
      { _id: { $in: customerIds }, role: 'customer' },
      { $set: { isActive } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} customers updated successfully`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update customers',
    });
  }
});

// @desc    Update customer details (admin override)
// @route   PUT /api/admin/customers/:id
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, isActive, isVerified } = req.body;

    const customer = await User.findById(req.params.id);

    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
      return;
    }

    // Update fields if provided
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (typeof isActive === 'boolean') customer.isActive = isActive;
    if (typeof isVerified === 'boolean') customer.isVerified = isVerified;

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update customer',
    });
  }
});

export default router;