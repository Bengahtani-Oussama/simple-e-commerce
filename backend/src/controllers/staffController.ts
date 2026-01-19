import { Response } from 'express';
import Admin from '../models/Admin';
import { AuthRequest } from '../types';

// Get all staff members
export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Admin.find({}).select('-password -resetPasswordToken -resetPasswordExpire -refreshToken').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff members',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get staff member by ID
export const getStaffById = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Admin.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpire -refreshToken');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching staff member',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Create new staff member
export const createStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if email already exists
    const existingStaff = await Admin.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const newStaff = await Admin.create({
      name,
      email,
      password,
      role: role || 'staff',
      permissions: permissions || [],
    });

    // Remove sensitive data from response
    const staffResponse = await Admin.findById(newStaff._id).select('-password -resetPasswordToken -resetPasswordExpire -refreshToken');

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating staff member',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update staff member
export const updateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, permissions, isActive } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const staff = await Admin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire -refreshToken');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff member',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete staff member
export const deleteStaff = async (req: AuthRequest, res: Response) => {
  try {
    const staff = await Admin.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting staff member',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update staff permissions
export const updateStaffPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const { permissions } = req.body;

    const staff = await Admin.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire -refreshToken');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Staff permissions updated successfully',
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating staff permissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
