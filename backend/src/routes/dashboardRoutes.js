import express from 'express';
import {
  getStats,
  getRecentTransactions,
  getStockOverview,
} from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAuth, getStats);
router.get('/recent-transactions', requireAuth, getRecentTransactions);
router.get('/stock-overview', requireAuth, getStockOverview);

export default router;
