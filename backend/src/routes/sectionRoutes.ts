import express from 'express';
import {
  getSections,
  getPublicSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  addProductsToSection,
  removeProductFromSection,
  cleanOutOfStockProducts,
  cleanAllSectionsStock,
} from '../controllers/sectionController';
import {
  getSectionPriorities,
  reorderProducts,
  togglePinProduct,
  toggleFeatureProduct,
  updateProductPriority,
  moveProductToPosition,
  getPinnedProducts,
  getFeaturedProducts,
  bulkUpdatePriorities,
} from '../controllers/productPriorityController';
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
 *     description: Returns only active sections that have the minimum required number of products in stock
 *     responses:
 *       200:
 *         description: Active sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: object
 *                         properties:
 *                           ar:
 *                             type: string
 *                           en:
 *                             type: string
 *                           fr:
 *                             type: string
 *                       products:
 *                         type: array
 *                       activeProductCount:
 *                         type: number
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
 *         description: Section ID
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *       404:
 *         description: Section not found
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
 *         description: Filter by active status
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
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
 *             required:
 *               - name
 *               - products
 *             properties:
 *               name:
 *                 type: object
 *                 required:
 *                   - ar
 *                   - en
 *                   - fr
 *                 properties:
 *                   ar:
 *                     type: string
 *                     example: "عروض الصيف"
 *                   en:
 *                     type: string
 *                     example: "Summer Offers"
 *                   fr:
 *                     type: string
 *                     example: "Offres d'été"
 *               description:
 *                 type: object
 *                 properties:
 *                   ar:
 *                     type: string
 *                   en:
 *                     type: string
 *                   fr:
 *                     type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 5
 *                 description: Array of product IDs (minimum 5)
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               order:
 *                 type: number
 *                 default: 0
 *               minProducts:
 *                 type: number
 *                 default: 5
 *     responses:
 *       201:
 *         description: Section created successfully
 *       400:
 *         description: Invalid input or insufficient products
 *       401:
 *         description: Unauthorized
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   ar:
 *                     type: string
 *                   en:
 *                     type: string
 *                   fr:
 *                     type: string
 *               description:
 *                 type: object
 *               products:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Section updated successfully
 *       404:
 *         description: Section not found
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
 *       404:
 *         description: Section not found
 */
router.delete('/:id', deleteSection);

/**
 * @swagger
 * /sections/{id}/products:
 *   post:
 *     summary: Add products to section (Admin)
 *     tags: [Sections - Admin]
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
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of product IDs to add
 *     responses:
 *       200:
 *         description: Products added successfully
 *       400:
 *         description: Invalid product IDs or out of stock
 *       404:
 *         description: Section not found
 */
router.post('/:id/products', addProductsToSection);

/**
 * @swagger
 * /sections/{id}/products/{productId}:
 *   delete:
 *     summary: Remove product from section (Admin)
 *     tags: [Sections - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Section ID
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Product removed successfully
 *       400:
 *         description: Cannot remove - would violate minimum products requirement
 *       404:
 *         description: Section or product not found
 */
router.delete('/:id/products/:productId', removeProductFromSection);

/**
 * @swagger
 * /sections/{id}/clean-stock:
 *   post:
 *     summary: Remove out-of-stock products from section (Admin)
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
 *         description: Out-of-stock products removed successfully
 *       400:
 *         description: Cannot clean - would violate minimum products requirement
 *       404:
 *         description: Section not found
 */
router.post('/:id/clean-stock', cleanOutOfStockProducts);

/**
 * @swagger
 * /sections/clean-all-stock:
 *   post:
 *     summary: Remove out-of-stock products from all sections (Admin)
 *     tags: [Sections - Admin]
 *     security:
 *       - bearerAuth: []
 *     description: Bulk operation to clean out-of-stock products from all active sections
 *     responses:
 *       200:
 *         description: All sections cleaned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCleaned:
 *                       type: number
 *                     sectionsProcessed:
 *                       type: number
 *                     details:
 *                       type: array
 */
router.post('/clean-all-stock', cleanAllSectionsStock);

// ============================================
// PRODUCT PRIORITY ROUTES (Admin only)
// ============================================

/**
 * @swagger
 * /sections/{id}/priorities:
 *   get:
 *     summary: Get products with priority settings for a section
 *     tags: [Sections - Product Priority]
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
 *         description: Products with priorities retrieved
 */
router.get('/:id/priorities', getSectionPriorities);

/**
 * @swagger
 * /sections/{id}/priorities/reorder:
 *   put:
 *     summary: Reorder products (drag and drop)
 *     tags: [Sections - Product Priority]
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
 *             required:
 *               - productOrder
 *             properties:
 *               productOrder:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     position:
 *                       type: number
 *     responses:
 *       200:
 *         description: Products reordered successfully
 */
router.put('/:id/priorities/reorder', reorderProducts);

/**
 * @swagger
 * /sections/{id}/priorities/pinned:
 *   get:
 *     summary: Get pinned products for section
 *     tags: [Sections - Product Priority]
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
router.get('/:id/priorities/pinned', getPinnedProducts);

/**
 * @swagger
 * /sections/{id}/priorities/featured:
 *   get:
 *     summary: Get featured products for section
 *     tags: [Sections - Product Priority]
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
router.get('/:id/priorities/featured', getFeaturedProducts);

/**
 * @swagger
 * /sections/{id}/priorities/bulk:
 *   put:
 *     summary: Bulk update product priorities
 *     tags: [Sections - Product Priority]
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
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     position:
 *                       type: number
 *                     isPinned:
 *                       type: boolean
 *                     isFeatured:
 *                       type: boolean
 *                     customNote:
 *                       type: string
 *     responses:
 *       200:
 *         description: Priorities updated successfully
 */
router.put('/:id/priorities/bulk', bulkUpdatePriorities);

/**
 * @swagger
 * /sections/{id}/priorities/{productId}:
 *   put:
 *     summary: Update single product priority settings
 *     tags: [Sections - Product Priority]
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: number
 *               isPinned:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               customNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product priority updated
 */
router.put('/:id/priorities/:productId', updateProductPriority);

/**
 * @swagger
 * /sections/{id}/priorities/{productId}/pin:
 *   put:
 *     summary: Toggle pin product to top
 *     tags: [Sections - Product Priority]
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
router.put('/:id/priorities/:productId/pin', togglePinProduct);

/**
 * @swagger
 * /sections/{id}/priorities/{productId}/feature:
 *   put:
 *     summary: Toggle product featured status
 *     tags: [Sections - Product Priority]
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
router.put('/:id/priorities/:productId/feature', toggleFeatureProduct);

/**
 * @swagger
 * /sections/{id}/priorities/{productId}/move:
 *   put:
 *     summary: Move product to specific position
 *     tags: [Sections - Product Priority]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPosition
 *             properties:
 *               newPosition:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Product moved successfully
 */
router.put('/:id/priorities/:productId/move', moveProductToPosition);

export default router;