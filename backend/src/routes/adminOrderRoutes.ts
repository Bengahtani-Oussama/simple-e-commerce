import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  processReturn,
  getOrderStats,
  bulkUpdateOrders,
  getReturnRequests,
} from '../controllers/adminOrderController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All admin order routes require admin authentication
router.use(protect, isAdmin);

/**
 * @swagger
 * /admin/orders/stats:
 *   get:
 *     summary: Get order statistics and analytics
 *     tags: [Admin - Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Order statistics retrieved successfully
 */
router.get('/stats', getOrderStats);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders with pagination and filters
 *     tags: [Admin - Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: hasReturn
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 *       - in: query
 *         name: wilaya
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Admin - Orders]
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
 *         description: Order retrieved successfully
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Admin - Orders]
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
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *               estimatedDeliveryDate:
 *                 type: string
 *                 format: date
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.put('/:id/status', updateOrderStatus);

/**
 * @swagger
 * /admin/orders/{id}/items/{itemId}/return:
 *   put:
 *     summary: Process item return
 *     tags: [Admin - Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [returnStatus]
 *             properties:
 *               returnStatus:
 *                 type: string
 *                 enum: [requested, approved, rejected, completed]
 *               returnQuantity:
 *                 type: number
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Return processed successfully
 */
router.put('/:id/items/:itemId/return', processReturn);

// ============================================
// NEW ENDPOINTS
// ============================================

/**
 * @swagger
 * /admin/orders/bulk-update:
 *   post:
 *     summary: Bulk update order statuses (NEW)
 *     tags: [Admin - Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderIds, status]
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *               adminNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Orders updated successfully
 */
router.post('/bulk-update', bulkUpdateOrders);

/**
 * @swagger
 * /admin/orders/returns:
 *   get:
 *     summary: Get all return requests (NEW)
 *     tags: [Admin - Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, requested, approved, rejected, completed]
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
 *         description: Return requests retrieved successfully
 */
router.get('/returns', getReturnRequests);

export default router;