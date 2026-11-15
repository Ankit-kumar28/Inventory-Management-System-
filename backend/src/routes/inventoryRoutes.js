import express from 'express';
import {
  getInventory,
  getLowStock,
  getOutOfStock,
} from '../controllers/inventoryController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getInventory);
router.get('/low-stock', requireAuth, getLowStock);
router.get('/out-of-stock', requireAuth, getOutOfStock);

export default router;
