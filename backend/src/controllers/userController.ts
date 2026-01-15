import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || req.body.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add address',
    });
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Find address using find() instead of id()
    const address = user.addresses.find(
      (addr) => addr._id?.toString() === req.params.addressId
    );
    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    // If setting as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update address',
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id?.toString() !== req.params.addressId
    );

    // If no addresses left or deleted address was default, set first as default
    if (user.addresses.length > 0 && !user.addresses.some((addr) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete address',
    });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:addressId/default
export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Remove default from all addresses
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set the selected address as default using find() instead of id()
    const address = user.addresses.find(
      (addr) => addr._id?.toString() === req.params.addressId
    );
    if (!address) {
      res.status(404).json({
        success: false,
        message: 'Address not found',
      });
      return;
    }

    address.isDefault = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to set default address',
    });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get addresses',
    });
  }
};