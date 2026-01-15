import express from 'express';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Admin routes
router.post('/', protect, isAdmin, createBrand);
router.put('/:id', protect, isAdmin, updateBrand);
router.delete('/:id', protect, isAdmin, deleteBrand);

export default router;