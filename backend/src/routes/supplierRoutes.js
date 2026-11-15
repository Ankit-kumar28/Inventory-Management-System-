import express from 'express';
import {
  getSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { createSupplierValidators, updateSupplierValidators } from '../validators/supplierValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.get('/', requireAuth, getSuppliers);
router.get('/:id', requireAuth, getSupplierById);
router.post('/', requireAdmin, createSupplierValidators, handleValidation, createSupplier);
router.put('/:id', requireAdmin, updateSupplierValidators, handleValidation, updateSupplier);
router.delete('/:id', requireAdmin, deleteSupplier);

export default router;
