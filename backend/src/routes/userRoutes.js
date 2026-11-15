import express from 'express';
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus,
  getActivityLogs,
} from '../controllers/userController.js';
import { requireAdmin } from '../middleware/auth.js';
import { createUserValidators, updateUserValidators } from '../validators/userValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/', getUsers);
router.post('/', createUserValidators, handleValidation, createUser);
router.get('/activity-logs', getActivityLogs);
router.get('/:id', getUserById);
router.put('/:id', updateUserValidators, handleValidation, updateUser);
router.patch('/:id/status', toggleUserStatus);

export default router;
