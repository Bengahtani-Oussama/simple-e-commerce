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

/**
 * @swagger
 * /upload/product/image:
 *   post:
 *     summary: Upload single product image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
router.post(
  '/product/image',
  uploadProductImages.single('image'),
  uploadImage
);

/**
 * @swagger
 * /upload/product/images:
 *   post:
 *     summary: Upload multiple product images (max 10)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post(
  '/product/images',
  uploadProductImages.array('images', 10),
  uploadImages
);

/**
 * @swagger
 * /upload/category/image:
 *   post:
 *     summary: Upload category image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Category image uploaded successfully
 */
router.post(
  '/category/image',
  uploadCategoryImage.single('image'),
  uploadImage
);

/**
 * @swagger
 * /upload/brand/logo:
 *   post:
 *     summary: Upload brand logo
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Brand logo uploaded successfully
 */
router.post(
  '/brand/logo',
  uploadBrandLogo.single('logo'),
  uploadImage
);

/**
 * @swagger
 * /upload/image:
 *   delete:
 *     summary: Delete image from cloud storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete('/image', deleteImage);

export default router;