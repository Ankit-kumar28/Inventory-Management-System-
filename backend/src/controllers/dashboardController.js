import * as dashboardService from '../services/dashboardService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return ApiResponse.success(res, stats);
  } catch (err) {
    next(err);
  }
}

export async function getRecentTransactions(req, res, next) {
  try {
    const { limit = 10 } = req.query;
    const transactions = await dashboardService.getRecentTransactions(parseInt(limit));
    return ApiResponse.success(res, { transactions });
  } catch (err) {
    next(err);
  }
}

export async function getStockOverview(req, res, next) {
  try {
    const data = await dashboardService.getStockOverview();
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
}
