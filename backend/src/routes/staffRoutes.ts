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

/**
 * @swagger
 * /admin/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff members retrieved successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/',isAdmin , getAllStaff);

/**
 * @swagger
 * /admin/staff/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member retrieved successfully
 *       404:
 *         description: Staff member not found
 */
router.get('/:id',isAdmin, getStaffById);

/**
 * @swagger
 * /admin/staff:
 *   post:
 *     summary: Create new staff member
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, role]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [manager, staff, superadmin]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/',isAdmin, hasPermission('manage_users'), createStaff);

/**
 * @swagger
 * /admin/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 */
router.put('/:id', isAdmin, updateStaff);

/**
 * @swagger
 * /admin/staff/{id}:
 *   delete:
 *     summary: Delete staff member (Super admin only)
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *       403:
 *         description: Forbidden - Super admin only
 */
router.delete('/:id', isAdmin, isSuperAdmin, deleteStaff);

/**
 * @swagger
 * /admin/staff/{id}/permissions:
 *   patch:
 *     summary: Update staff member permissions (Super admin only)
 *     tags: [Admin - Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissions]
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [manage_users, manage_products, manage_orders, manage_categories, manage_brands, manage_coupons, manage_inventory]
 *     responses:
 *       200:
 *         description: Permissions updated successfully
 *       403:
 *         description: Forbidden - Super admin only
 */
router.patch('/:id/permissions',isAdmin, isSuperAdmin, updateStaffPermissions);

export default router;
