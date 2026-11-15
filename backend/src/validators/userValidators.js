import { body } from 'express-validator';
import { ROLES } from '../constants/index.js';

export const createUserValidators = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phoneNumber').optional().trim(),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
];

export const updateUserValidators = [
  body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().trim(),
];
