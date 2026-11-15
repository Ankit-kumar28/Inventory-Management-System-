import * as transactionService from '../services/transactionService.js';
import { createLog } from '../services/activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateObjectId } from '../utils/objectIdValidator.js';

export async function stockIn(req, res, next) {
  try {
    const { product, supplier, quantity, unitPrice, referenceNumber, notes } = req.body;
    const result = await transactionService.stockIn({
      productId: product,
      supplierId: supplier,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(unitPrice || 0),
      referenceNumber,
      notes,
      userId: req.session.userId,
    });
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.STOCK_IN,
      entityType: 'StockTransaction',
      entityId: result.transaction._id,
      description: `Stock-in: ${quantity} units of ${result.product.productName}`,
    });
    return ApiResponse.created(res, result, 'Stock-in recorded successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function stockOut(req, res, next) {
  try {
    const { product, quantity, reason, referenceNumber, notes } = req.body;
    const result = await transactionService.stockOut({
      productId: product,
      quantity: parseInt(quantity),
      reason,
      referenceNumber,
      notes,
      userId: req.session.userId,
    });
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.STOCK_OUT,
      entityType: 'StockTransaction',
      entityId: result.transaction._id,
      description: `Stock-out: ${quantity} units of ${result.product.productName}. Reason: ${reason}`,
    });
    return ApiResponse.success(res, result, 'Stock-out recorded successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const { page = 1, limit = 20, type, product, startDate, endDate, search } = req.query;
    const result = await transactionService.getTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      productId: product,
      startDate,
      endDate,
      search,
    });
    return ApiResponse.paginated(res, result.transactions, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTransactionById(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Transaction ID')) return;
    const transaction = await transactionService.getTransactionById(req.params.id);
    return ApiResponse.success(res, { transaction });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}
