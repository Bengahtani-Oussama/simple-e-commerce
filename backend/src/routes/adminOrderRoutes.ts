import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  processReturn,
  getOrderStats,
} from '../controllers/adminOrderController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All admin order routes require admin authentication
router.use(protect, isAdmin);

router.get('/stats', getOrderStats);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/items/:itemId/return', processReturn);

export default router;