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

router.put('/profile', updateProfile);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.put('/addresses/:addressId/default', setDefaultAddress);

export default router;