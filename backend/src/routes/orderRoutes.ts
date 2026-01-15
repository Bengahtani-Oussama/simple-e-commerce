import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
} from '../controllers/orderController';
import { protect, isCustomer } from '../middleware/authMiddleware';

const router = express.Router();

// All order routes require customer authentication
router.use(protect, isCustomer);

router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

export default router;