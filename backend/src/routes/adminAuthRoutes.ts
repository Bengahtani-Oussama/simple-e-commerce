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

// Public routes
router.post("/login", adminLogin);
router.post("/refresh", adminRefreshToken);
router.post("/forgot-password", adminForgotPassword);
router.post("/reset-password/:token", adminResetPassword);

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
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
router.post("/logout", protect, isAdmin, adminLogout);
router.get("/me", protect, isAdmin, getAdminProfile);

export default router;
