import * as categoryService from "../services/categoryService.js";
import { createLog } from "../services/activityLogService.js";
import { ACTIVITY_ACTIONS } from "../constants/index.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { validateObjectId } from "../utils/objectIdValidator.js";

export async function getCategories(req, res, next) {
  try {
    const { page = 1, limit = 20, search, includeInactive } = req.query;
    const result = await categoryService.getCategories({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      includeInactive: includeInactive === "true",
    });
    return ApiResponse.paginated(res, result.categories, {
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

export async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.CREATE_CATEGORY,
      entityType: "Category",
      entityId: category._id,
      description: `Created category: ${category.categoryName}`,
    });
    return ApiResponse.created(
      res,
      { category },
      "Category created successfully",
    );
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getCategoryById(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, "Category ID")) return;
    const category = await categoryService.getCategoryById(req.params.id);
    return ApiResponse.success(res, { category });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, "Category ID")) return;
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.UPDATE_CATEGORY,
      entityType: "Category",
      entityId: category._id,
      description: `Updated category: ${category.categoryName}`,
    });
    return ApiResponse.success(
      res,
      { category },
      "Category updated successfully",
    );
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, "Category ID")) return;
    const category = await categoryService.deleteCategory(req.params.id);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.DELETE_CATEGORY,
      entityType: "Category",
      entityId: category._id,
      description: `Deactivated category: ${category.categoryName}`,
    });
    return ApiResponse.success(
      res,
      { category },
      "Category deactivated successfully",
    );
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}
