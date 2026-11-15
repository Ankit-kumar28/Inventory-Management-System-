import { loginUser } from '../services/authService.js';
import { createLog } from '../services/activityLogService.js';
import { User } from '../models/User.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    req.session.regenerate(async (err) => {
      if (err) return next(err);
      req.session.userId = user._id.toString();
      req.session.userRole = user.role;
      req.session.userEmail = user.email;

      await createLog({
        userId: user._id,
        action: ACTIVITY_ACTIONS.LOGIN,
        description: `User logged in: ${user.email}`,
      });

      return ApiResponse.success(res, { user: user.toSafeObject() }, 'Login successful');
    });
  } catch (err) {
    if (err.status) return ApiResponse.error(res, err.message, err.status);
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const userId = req.session.userId;
    const userEmail = req.session.userEmail;

    req.session.destroy(async (err) => {
      if (err) return next(err);
      res.clearCookie(process.env.SESSION_NAME || 'inventory.sid');

      if (userId) {
        await createLog({
          userId,
          action: ACTIVITY_ACTIONS.LOGOUT,
          description: `User logged out: ${userEmail}`,
        });
      }

      return ApiResponse.success(res, {}, 'Logged out successfully');
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.session.userId).select('-password').lean();
    if (!user) {
      req.session.destroy(() => {});
      return ApiResponse.error(res, 'Session invalid. Please log in again.', 401);
    }
    return ApiResponse.success(res, { user }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
}
