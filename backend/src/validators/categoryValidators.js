import { body } from 'express-validator';

export const createCategoryValidators = [
  body('categoryName').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }).withMessage('Category name must not exceed 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
];

export const updateCategoryValidators = [
  body('categoryName').optional().trim().notEmpty().withMessage('Category name cannot be empty').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];
