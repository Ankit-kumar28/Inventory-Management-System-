import * as userService from '../services/userService.js';
import { createLog, getLogs } from '../services/activityLogService.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateObjectId } from '../utils/objectIdValidator.js';

export async function getUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const result = await userService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      role,
      isActive,
    });
    return ApiResponse.paginated(res, result.users, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.CREATE_USER,
      entityType: 'User',
      entityId: user._id,
      description: `Created user: ${user.email} (${user.role})`,
    });
    return ApiResponse.created(res, { user }, 'User created successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'User ID')) return;
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, { user });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'User ID')) return;
    const user = await userService.updateUser(req.params.id, req.body, req.session.userId, req.session.userRole);
    await createLog({
      userId: req.session.userId,
      action: ACTIVITY_ACTIONS.UPDATE_USER,
      entityType: 'User',
      entityId: user._id,
      description: `Updated user: ${user.email}`,
    });
    return ApiResponse.success(res, { user }, 'User updated successfully');
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    if (!validateObjectId(res, req.params.id, 'User ID')) return;
    const user = await userService.toggleUserStatus(req.params.id, req.session.userId);
    const action = user.isActive ? ACTIVITY_ACTIONS.ACTIVATE_USER : ACTIVITY_ACTIONS.DEACTIVATE_USER;
    await createLog({
      userId: req.session.userId,
      action,
      entityType: 'User',
      entityId: user._id,
      description: `${user.isActive ? 'Activated' : 'Deactivated'} user: ${user.email}`,
    });
    return ApiResponse.success(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function getActivityLogs(req, res, next) {
  try {
    const { page = 1, limit = 30, userId, action, entityType, startDate, endDate } = req.query;
    const result = await getLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      action,
      entityType,
      startDate,
      endDate,
    });
    return ApiResponse.paginated(res, result.logs, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}
