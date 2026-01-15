import express from 'express';
import {
  uploadImage,
  uploadImages,
  deleteImage,
} from '../controllers/uploadController';
import {
  uploadProductImages,
  uploadCategoryImage,
  uploadBrandLogo,
} from '../middleware/uploadMiddleware';
import { protect, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// All upload routes require admin authentication
router.use(protect, isAdmin);

// Product images
router.post(
  '/product/image',
  uploadProductImages.single('image'),
  uploadImage
);
router.post(
  '/product/images',
  uploadProductImages.array('images', 10),
  uploadImages
);

// Category image
router.post(
  '/category/image',
  uploadCategoryImage.single('image'),
  uploadImage
);

// Brand logo
router.post(
  '/brand/logo',
  uploadBrandLogo.single('logo'),
  uploadImage
);

// Delete image
router.delete('/image', deleteImage);

export default router;