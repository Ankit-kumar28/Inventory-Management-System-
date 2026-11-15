import * as inventoryService from '../services/inventoryService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getInventory(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category, supplier, stockStatus } = req.query;
    const result = await inventoryService.getInventory({ page, limit, search, category, supplier, stockStatus });
    return ApiResponse.paginated(res, result.products, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(req, res, next) {
  try {
    const products = await inventoryService.getLowStockProducts();
    return ApiResponse.success(res, { products, count: products.length });
  } catch (err) {
    next(err);
  }
}

export async function getOutOfStock(req, res, next) {
  try {
    const products = await inventoryService.getOutOfStockProducts();
    return ApiResponse.success(res, { products, count: products.length });
  } catch (err) {
    next(err);
  }
}
