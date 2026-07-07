import express from 'express';
import {
  getInventoryOverview,
  adjustStock,
  getStockHistory,
  getAllStockHistory,
  getLowStockAlerts,
  bulkStockAdjust,
  getInventoryValueReport,
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
 *     parameters:
 *       - in: query
 *         name: lowStockThreshold
 *         schema:
 *           type: number
 *           default: 10
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
 *           enum: [adjustment, sale, return, restock, correction]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
 *             required: [productId, adjustment]
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *                 description: Required for configurable products
 *               adjustment:
 *                 type: number
 *                 description: Positive to add, negative to subtract
 *               type:
 *                 type: string
 *                 enum: [adjustment, sale, return, restock, correction]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
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
 *                   required: [productId, adjustment]
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     adjustment:
 *                       type: number
 *                     type:
 *                       type: string
 *                     reason:
 *                       type: string
 *     responses:
 *       200:
 *         description: Stock adjustments applied successfully
 */
router.post('/bulk-adjust', bulkStockAdjust);

// ============================================
// NEW ENDPOINT
// ============================================

/**
 * @swagger
 * /admin/inventory/value-report:
 *   get:
 *     summary: Get inventory value report (NEW)
 *     tags: [Admin - Inventory]
 *     security:
 *       - bearerAuth: []
 *     description: Get total stock value, cost value, and potential profit breakdown by category and brand
 *     responses:
 *       200:
 *         description: Inventory value report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalStockValue:
 *                           type: number
 *                         totalCostValue:
 *                           type: number
 *                         totalPotentialProfit:
 *                           type: number
 *                         profitMargin:
 *                           type: string
 *                     byCategory:
 *                       type: object
 *                     byBrand:
 *                       type: object
 */
router.get('/value-report', getInventoryValueReport);

export default router;