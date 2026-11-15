import express from 'express';
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createProductValidators, updateProductValidators } from '../validators/productValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, getProducts);
router.get('/:id', requireAuth, getProductById);
router.post('/', requireAdmin, createProductValidators, handleValidation, createProduct);
router.put('/:id', requireAdmin, updateProductValidators, handleValidation, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
