import express from 'express';
import {
  adminLogin,
  adminRefreshToken,
  adminLogout,
  adminForgotPassword,
  adminResetPassword,
  getAdminProfile,
} from '../controllers/adminAuthController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);
router.post('/refresh', adminRefreshToken);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password/:token', adminResetPassword);

// Protected routes
router.post('/logout', protect, isAdmin, adminLogout);
router.get('/me', protect, isAdmin, getAdminProfile);

export default router;