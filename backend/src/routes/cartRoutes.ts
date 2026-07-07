import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
} from '../controllers/cartController';
import { protect, isCustomer } from '../middleware/authMiddleware';

const router = express.Router();

// All cart routes require customer authentication
router.use(protect, isCustomer);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/', getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *                 description: Required for configurable products
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 default: 1
 *               selectedAttributes:
 *                 type: object
 *                 description: Selected attributes (optional, for reference)
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 */
router.post('/items', addToCart);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item updated successfully
 */
router.put('/items/:itemId', updateCartItem);

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.delete('/items/:itemId', removeFromCart);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear entire shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
router.delete('/', clearCart);

// ============================================
// NEW ENDPOINT
// ============================================

/**
 * @swagger
 * /cart/validate:
 *   post:
 *     summary: Validate cart before checkout (NEW)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     description: Validates all cart items for stock availability, price changes, and product availability
 *     responses:
 *       200:
 *         description: Cart is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                 warnings:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Cart has validation errors
 */
router.post('/validate', validateCart);

export default router;