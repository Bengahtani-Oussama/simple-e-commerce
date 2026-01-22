import express from 'express';
import {
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAddresses,
} from '../controllers/userController';
import { protect, isCustomer } from '../middleware/authMiddleware';

const router = express.Router();

// All user routes require user authentication
router.use(protect, isCustomer);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 */
router.put('/profile', updateProfile);

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     summary: Get user addresses
 *     tags: [Users - Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   isDefault:
 *                     type: boolean
 */
router.get('/addresses', getAddresses);

/**
 * @swagger
 * /users/addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Users - Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, street, city, country]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid input
 */
router.post('/addresses', addAddress);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Users - Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               type:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.put('/addresses/:addressId', updateAddress);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Users - Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete('/addresses/:addressId', deleteAddress);

/**
 * @swagger
 * /users/addresses/{addressId}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Users - Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       404:
 *         description: Address not found
 */
router.put('/addresses/:addressId/default', setDefaultAddress);

export default router;