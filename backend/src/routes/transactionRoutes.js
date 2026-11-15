import express from 'express';
import {
  stockIn,
  stockOut,
  getTransactions,
  getTransactionById,
} from '../controllers/transactionController.js';
import { requireAuth } from '../middleware/auth.js';
import { stockInValidators, stockOutValidators } from '../validators/transactionValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.post('/stock-in', requireAuth, stockInValidators, handleValidation, stockIn);
router.post('/stock-out', requireAuth, stockOutValidators, handleValidation, stockOut);
router.get('/', requireAuth, getTransactions);
router.get('/:id', requireAuth, getTransactionById);

export default router;
