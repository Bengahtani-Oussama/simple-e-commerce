import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  checkVariantStock,
  getVariantByAttributes,
  getAvailableOptions,
  updateProductOptions,
} from '../controllers/productController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with pagination and filters
 *     tags: [Products]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [simple, configurable]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/slug/:slug', getProductBySlug);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /products/{id}/variants/{variantId}/stock:
 *   get:
 *     summary: Check variant stock availability
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Stock availability checked
 */
router.get('/:id/variants/:variantId/stock', checkVariantStock);

// ============================================
// NEW ENDPOINTS
// ============================================

/**
 * @swagger
 * /products/{id}/variants/find:
 *   post:
 *     summary: Find variant by attributes (NEW)
 *     tags: [Products]
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
 *             required: [attributes]
 *             properties:
 *               attributes:
 *                 type: object
 *                 example:
 *                   color: "black"
 *                   size: "M"
 *     responses:
 *       200:
 *         description: Variant found
 *       404:
 *         description: No variant found with specified attributes
 */
router.post('/:id/variants/find', getVariantByAttributes);

/**
 * @swagger
 * /products/{id}/options/available:
 *   get:
 *     summary: Get available options for an option code (NEW)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: optionCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The option code (e.g., "color", "size")
 *       - in: query
 *         name: selectedAttributes
 *         schema:
 *           type: string
 *         description: JSON string of already selected attributes
 *         example: '{"color":"black"}'
 *     responses:
 *       200:
 *         description: Available options retrieved
 */
router.get('/:id/options/available', getAvailableOptions);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, name, slug, description, category, basePricing, status]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [simple, configurable]
 *               name:
 *                 type: object
 *               slug:
 *                 type: string
 *               description:
 *                 type: object
 *               category:
 *                 type: string
 *               basePricing:
 *                 type: object
 *                 properties:
 *                   price:
 *                     type: number
 *               options:
 *                 type: array
 *                 description: Required for configurable products
 *               variants:
 *                 type: array
 *                 description: Required for configurable products
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/', protect, isAdmin, createProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
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
 *         description: Product updated successfully
 */
router.put('/:id', protect, isAdmin, updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
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
 *         description: Product deleted successfully
 */
router.delete('/:id', protect, isAdmin, deleteProduct);

/**
 * @swagger
 * /products/{id}/options:
 *   put:
 *     summary: Update product options (Admin only) (NEW)
 *     tags: [Products]
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
 *             required: [options]
 *             properties:
 *               options:
 *                 type: array
 *     responses:
 *       200:
 *         description: Product options updated successfully
 */
router.put('/:id/options', protect, isAdmin, updateProductOptions);

/**
 * @swagger
 * /products/{id}/variants:
 *   post:
 *     summary: Add variant to product (Admin only)
 *     tags: [Products - Variants]
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
 *             required: [sku, attributes, pricing, inventory]
 *             properties:
 *               sku:
 *                 type: string
 *               attributes:
 *                 type: object
 *               pricing:
 *                 type: object
 *                 properties:
 *                   price:
 *                     type: number
 *               inventory:
 *                 type: object
 *                 properties:
 *                   stock:
 *                     type: number
 *     responses:
 *       201:
 *         description: Variant added successfully
 */
router.post('/:id/variants', protect, isAdmin, addVariant);

/**
 * @swagger
 * /products/{id}/variants/{variantId}:
 *   put:
 *     summary: Update product variant (Admin only)
 *     tags: [Products - Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Variant updated successfully
 */
router.put('/:id/variants/:variantId', protect, isAdmin, updateVariant);

/**
 * @swagger
 * /products/{id}/variants/{variantId}:
 *   delete:
 *     summary: Delete product variant (Admin only)
 *     tags: [Products - Variants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *         description: Variant deleted successfully
 */
router.delete('/:id/variants/:variantId', protect, isAdmin, deleteVariant);

export default router;