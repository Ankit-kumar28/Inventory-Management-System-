import express from 'express';
import {
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createCategoryValidators, updateCategoryValidators } from '../validators/categoryValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, getCategories);
router.get('/:id', requireAuth, getCategoryById);
router.post('/', requireAdmin, createCategoryValidators, handleValidation, createCategory);
router.put('/:id', requireAdmin, updateCategoryValidators, handleValidation, updateCategory);
router.delete('/:id', requireAdmin, deleteCategory);

export default router;
