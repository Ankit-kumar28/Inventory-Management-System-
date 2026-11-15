import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES } from '../constants/index.js';

export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return ApiResponse.error(res, 'Authentication required. Please log in.', 401);
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }
  if (req.session.userRole !== ROLES.ADMIN) {
    return ApiResponse.error(res, 'Administrator access required.', 403);
  }
  next();
}

export function requireStaffOrAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return ApiResponse.error(res, 'Authentication required.', 401);
  }
  if (![ROLES.ADMIN, ROLES.STAFF].includes(req.session.userRole)) {
    return ApiResponse.error(res, 'Access denied.', 403);
  }
  next();
}
