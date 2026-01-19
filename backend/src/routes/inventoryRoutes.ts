// backend/src/routes/inventoryRoutes.ts
import express from 'express';
import {
  getInventoryOverview,
  adjustStock,
  getStockHistory,
  getAllStockHistory,
  getLowStockAlerts,
  bulkStockAdjust,
} from '../controllers/inventoryController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All inventory routes require admin authentication
router.use(protect, isAdmin);

// Inventory management
router.get('/overview', getInventoryOverview);
router.get('/low-stock', getLowStockAlerts);
router.get('/history', getAllStockHistory);
router.get('/history/:productId/:variantId', getStockHistory);
router.post('/adjust', adjustStock);
router.post('/bulk-adjust', bulkStockAdjust);

export default router;