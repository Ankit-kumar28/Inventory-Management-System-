import * as supplierService from '../services/supplierService.js';
import { createLog } from '../services/activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateObjectId } from '../utils/objectIdValidator.js';

export async function getSuppliers(req, res, next) {
  try {
    const { page = 1, limit = 20, search, includeInactive } = req.query;
    const result = await supplierService.getSuppliers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      includeInactive: includeInactive === 'true',
    });
    return ApiResponse.paginated(res, result.suppliers, {
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

export async function createSupplier(req, res, next) {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.CREATE_SUPPLIER,
      entityType: 'Supplier',
      entityId: supplier._id,
      description: `Created supplier: ${supplier.supplierName}`,
    });
    return ApiResponse.created(res, { supplier }, 'Supplier created successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getSupplierById(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Supplier ID')) return;
    const supplier = await supplierService.getSupplierById(req.params.id);
    return ApiResponse.success(res, { supplier });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Supplier ID')) return;
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.UPDATE_SUPPLIER,
      entityType: 'Supplier',
      entityId: supplier._id,
      description: `Updated supplier: ${supplier.supplierName}`,
    });
    return ApiResponse.success(res, { supplier }, 'Supplier updated successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'Supplier ID')) return;
    const supplier = await supplierService.deleteSupplier(req.params.id);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.DELETE_SUPPLIER,
      entityType: 'Supplier',
      entityId: supplier._id,
      description: `Deactivated supplier: ${supplier.supplierName}`,
    });
    return ApiResponse.success(res, { supplier }, 'Supplier deactivated successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}
