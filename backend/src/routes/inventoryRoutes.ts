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

/**
 * @swagger
 * /admin/inventory/overview:
 *   get:
 *     summary: Get inventory overview and statistics
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory overview retrieved successfully
 */
router.get('/overview', getInventoryOverview);

/**
 * @swagger
 * /admin/inventory/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           default: 10
 *     responses:
 *       200:
 *         description: Low stock products retrieved
 */
router.get('/low-stock', getLowStockAlerts);

/**
 * @swagger
 * /admin/inventory/history:
 *   get:
 *     summary: Get all stock history with pagination
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [adjustment, purchase, return, damage, loss]
 *     responses:
 *       200:
 *         description: Stock history retrieved successfully
 */
router.get('/history', getAllStockHistory);

/**
 * @swagger
 * /admin/inventory/history/{productId}/{variantId}:
 *   get:
 *     summary: Get stock history for specific product variant
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock history for variant retrieved
 */
router.get('/history/:productId/:variantId', getStockHistory);

/**
 * @swagger
 * /admin/inventory/adjust:
 *   post:
 *     summary: Adjust stock for a product variant
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantId, quantity, type]
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [adjustment, purchase, return, damage, loss]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 *       400:
 *         description: Invalid adjustment
 */
router.post('/adjust', adjustStock);

/**
 * @swagger
 * /admin/inventory/bulk-adjust:
 *   post:
 *     summary: Bulk adjust stock for multiple variants
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adjustments]
 *             properties:
 *               adjustments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, variantId, quantity, type]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     type:
 *                       type: string
 *     responses:
 *       200:
 *         description: Stock adjustments applied successfully
 */
router.post('/bulk-adjust', bulkStockAdjust);

export default router;