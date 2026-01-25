// FILE PATH: backend/src/routes/sectionRoutes.ts
// ACTION: Replace the entire existing file with this code

import express from 'express';
import {
  getPublicSections,
  getSection,
  getSections,
  createSection,
  updateSection,
  deleteSection,
  addProductsToSection,
  removeProductFromSection,
} from '../controllers/sectionController';
import {
  getSectionForDnD,
  reorderProducts,
  moveProduct,
  togglePinProduct,
  toggleFeatureProduct,
  batchUpdate,
  getPinnedProducts,
  getFeaturedProducts,
} from '../controllers/sectionDnDController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @swagger
 * /sections/public:
 *   get:
 *     summary: Get all active sections with in-stock products (Public)
 *     tags: [Sections - Public]
 *     responses:
 *       200:
 *         description: Active sections retrieved successfully
 */
router.get('/public', getPublicSections);

/**
 * @swagger
 * /sections/{id}:
 *   get:
 *     summary: Get section by ID (Public)
 *     tags: [Sections - Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 */
router.get('/:id', getSection);

// ============================================
// ADMIN ROUTES (Authentication required)
// ============================================

router.use(protect, isAdmin); // All routes below require admin authentication

/**
 * @swagger
 * /sections:
 *   get:
 *     summary: Get all sections with filters (Admin)
 *     tags: [Sections - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 */
router.get('/', getSections);

/**
 * @swagger
 * /sections:
 *   post:
 *     summary: Create new section (Admin)
 *     tags: [Sections - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, productIds]
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   ar: {type: string}
 *                   en: {type: string}
 *                   fr: {type: string}
 *               productIds:
 *                 type: array
 *                 items: {type: string}
 *               minProducts:
 *                 type: number
 *                 default: 5
 *     responses:
 *       201:
 *         description: Section created successfully
 */
router.post('/', createSection);

/**
 * @swagger
 * /sections/{id}:
 *   put:
 *     summary: Update section (Admin)
 *     tags: [Sections - Admin]
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
 *         description: Section updated successfully
 */
router.put('/:id', updateSection);

/**
 * @swagger
 * /sections/{id}:
 *   delete:
 *     summary: Delete section (Admin)
 *     tags: [Sections - Admin]
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
 *         description: Section deleted successfully
 */
router.delete('/:id', deleteSection);

// ============================================
// PRODUCT MANAGEMENT ROUTES
// ============================================

/**
 * @swagger
 * /sections/{id}/products:
 *   post:
 *     summary: Add products to section (Admin)
 *     tags: [Sections - Products]
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
 *             required: [productIds]
 *             properties:
 *               productIds:
 *                 type: array
 *                 items: {type: string}
 *     responses:
 *       200:
 *         description: Products added successfully
 */
router.post('/:id/products', addProductsToSection);

/**
 * @swagger
 * /sections/{id}/products/{productId}:
 *   delete:
 *     summary: Remove product from section (Admin)
 *     tags: [Sections - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed successfully
 */
router.delete('/:id/products/:productId', removeProductFromSection);

// ============================================
// DRAG & DROP ROUTES (React DnD Integration)
// ============================================

/**
 * @swagger
 * /sections/{id}/dnd:
 *   get:
 *     summary: Get section with ordered products for DnD (Admin)
 *     tags: [Sections - Drag & Drop]
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
 *         description: Section with ordered products retrieved
 */
router.get('/:id/dnd', getSectionForDnD);

/**
 * @swagger
 * /sections/{id}/dnd/reorder:
 *   put:
 *     summary: Reorder all products (PRIMARY DnD METHOD)
 *     tags: [Sections - Drag & Drop]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       This is the main endpoint for React DnD.
 *       Send the complete new order of product IDs.
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
 *             required: [newOrder]
 *             properties:
 *               newOrder:
 *                 type: array
 *                 items: {type: string}
 *                 description: Complete array of product IDs in new order
 *                 example: ["prod1", "prod2", "prod3"]
 *     responses:
 *       200:
 *         description: Products reordered successfully
 */
router.put('/:id/dnd/reorder', reorderProducts);

/**
 * @swagger
 * /sections/{id}/dnd/move:
 *   put:
 *     summary: Move single product to new position
 *     tags: [Sections - Drag & Drop]
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
 *             required: [productId, newPosition]
 *             properties:
 *               productId: {type: string}
 *               newPosition: {type: number}
 *     responses:
 *       200:
 *         description: Product moved successfully
 */
router.put('/:id/dnd/move', moveProduct);

/**
 * @swagger
 * /sections/{id}/dnd/pin/{productId}:
 *   put:
 *     summary: Toggle pin product to top
 *     tags: [Sections - Drag & Drop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product pin status toggled
 */
router.put('/:id/dnd/pin/:productId', togglePinProduct);

/**
 * @swagger
 * /sections/{id}/dnd/feature/{productId}:
 *   put:
 *     summary: Toggle product featured status
 *     tags: [Sections - Drag & Drop]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product featured status toggled
 */
router.put('/:id/dnd/feature/:productId', toggleFeatureProduct);

/**
 * @swagger
 * /sections/{id}/dnd/batch:
 *   put:
 *     summary: Batch update pin/feature status
 *     tags: [Sections - Drag & Drop]
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
 *               pin:
 *                 type: array
 *                 items: {type: string}
 *               unpin:
 *                 type: array
 *                 items: {type: string}
 *               feature:
 *                 type: array
 *                 items: {type: string}
 *               unfeature:
 *                 type: array
 *                 items: {type: string}
 *     responses:
 *       200:
 *         description: Batch update completed
 */
router.put('/:id/dnd/batch', batchUpdate);

/**
 * @swagger
 * /sections/{id}/dnd/pinned:
 *   get:
 *     summary: Get pinned products
 *     tags: [Sections - Drag & Drop]
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
 *         description: Pinned products retrieved
 */
router.get('/:id/dnd/pinned', getPinnedProducts);

/**
 * @swagger
 * /sections/{id}/dnd/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Sections - Drag & Drop]
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
 *         description: Featured products retrieved
 */
router.get('/:id/dnd/featured', getFeaturedProducts);

export default router;