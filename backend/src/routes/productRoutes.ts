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
} from '../controllers/productController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);
router.get('/:id/variants/:variantId/stock', checkVariantStock);

// Admin routes - Product management
router.post('/', protect, isAdmin, createProduct);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

// Admin routes - Variant management
router.post('/:id/variants', protect, isAdmin, addVariant);
router.put('/:id/variants/:variantId', protect, isAdmin, updateVariant);
router.delete('/:id/variants/:variantId', protect, isAdmin, deleteVariant);

export default router;