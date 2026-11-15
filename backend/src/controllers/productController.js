import * as productService from '../services/productService.js';
import { createLog } from '../services/activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateObjectId } from '../utils/objectIdValidator.js';

export async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, search, category, supplier, stockStatus, includeInactive, sortBy, sortOrder } = req.query;
    const result = await productService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      supplier,
      stockStatus,
      includeInactive: includeInactive === 'true',
      sortBy,
      sortOrder,
    });
    return ApiResponse.paginated(res, result.products, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.CREATE_PRODUCT,
      entityType: 'Product',
      entityId: product._id,
      description: `Created product: ${product.productName} (${product.sku})`,
    });
    return ApiResponse.created(res, { product }, 'Product created successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Product ID')) return;
    const product = await productService.getProductById(req.params.id);
    return ApiResponse.success(res, { product });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Product ID')) return;
    const product = await productService.updateProduct(req.params.id, req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.UPDATE_PRODUCT,
      entityType: 'Product',
      entityId: product._id,
      description: `Updated product: ${product.productName}`,
    });
    return ApiResponse.success(res, { product }, 'Product updated successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Product ID')) return;
    const { product, archived } = await productService.deleteProduct(req.params.id);
    const action = archived ? ACTIVITY_ACTIONS.ARCHIVE_PRODUCT : ACTIVITY_ACTIONS.DELETE_PRODUCT;
    await createLog({
      userId: req.session.userId,
      action,
      entityType: 'Product',
      entityId: product._id,
      description: `${archived ? 'Archived' : 'Deleted'} product: ${product.productName}`,
    });
    return ApiResponse.success(
      res,
      { product, archived },
      archived ? 'Product archived (has transaction history)' : 'Product deleted successfully'
    );
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}
