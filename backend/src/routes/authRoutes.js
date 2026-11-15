import express from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { loginValidators } from '../validators/authValidators.js';
import { handleValidation } from '../middleware/validate.js';

const router = express.Router();

router.post('/login', loginLimiter, loginValidators, handleValidation, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);

export default router;
