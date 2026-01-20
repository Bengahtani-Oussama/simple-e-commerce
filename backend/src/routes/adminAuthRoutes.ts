import express from "express";
import {
  adminLogin,
  adminRefreshToken,
  adminLogout,
  adminForgotPassword,
  adminResetPassword,
  getAdminProfile,
} from "../controllers/adminAuthController";
import { protect, isAdmin } from "../middleware/authMiddleware";
import Admin from "../models/Admin";

const router = express.Router();

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", adminLogin);

/**
 * @swagger
 * /admin/auth/refresh:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin - Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post("/refresh", adminRefreshToken);

/**
 * @swagger
 * /admin/auth/forgot-password:
 *   post:
 *     summary: Request admin password reset
 *     tags: [Admin - Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post("/forgot-password", adminForgotPassword);

/**
 * @swagger
 * /admin/auth/reset-password/{token}:
 *   post:
 *     summary: Reset admin password with token
 *     tags: [Admin - Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/reset-password/:token", adminResetPassword);

/**
 * @swagger
 * /admin/auth/change-password:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
router.put("/change-password", protect, isAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
      return;
    }

    // Get admin with password field
    const admin = await Admin.findById((req as any).user.id).select(
      "+password",
    );

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    // Verify current password
    const isPasswordCorrect = await admin.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    // Validate new password
    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
      return;
    }

    // Update password (will be hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to change password",
    });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/admin/auth/notification-preferences
/**
 * @swagger
 * /admin/auth/notification-preferences:
 *   put:
 *     summary: Update admin notification preferences
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               orderAlerts:
 *                 type: boolean
 *               inventoryAlerts:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 */
router.put("/notification-preferences", protect, isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById((req as any).user.id)

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // In a real app, you'd save preferences to a NotificationPreferences model
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: req.body,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update preferences",
    });
  }
});

// Protected routes
/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", protect, isAdmin, adminLogout);

/**
 * @swagger
 * /admin/auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin - Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, isAdmin, getAdminProfile);

export default router;
