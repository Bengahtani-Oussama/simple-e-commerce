import express from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffPermissions,
} from '../controllers/staffController';
import { protect, isSuperAdmin, hasPermission, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(hasPermission('manage_users'));

// Get all staff members
router.get('/',isAdmin , getAllStaff);

// Get staff member by ID
router.get('/:id',isAdmin, getStaffById);

// Create new staff member (manager or super admin)
router.post('/',isAdmin, hasPermission('manage_users'), createStaff);

// Update staff member
router.put('/:id', isAdmin, updateStaff);

// Delete staff member (super admin only)
router.delete('/:id', isAdmin, isSuperAdmin, deleteStaff);

// Update staff permissions (super admin only)
router.patch('/:id/permissions',isAdmin, isSuperAdmin, updateStaffPermissions);

export default router;
