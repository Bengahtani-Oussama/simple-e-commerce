// backend/src/routes/couponRoutes.ts
import express from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
} from '../controllers/couponController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public route - Validate coupon (for customers during checkout)
router.post('/validate', validateCoupon);

// Admin routes - All require admin authentication
router.use(protect, isAdmin);

router.get('/', getCoupons);
router.post('/', createCoupon);
router.get('/:id', getCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);
router.put('/:id/toggle-status', toggleCouponStatus);

export default router;