import { body } from 'express-validator';

export const stockInValidators = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('supplier').optional({ checkFalsy: true }).isMongoId().withMessage('Valid supplier ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unitPrice').optional().isFloat({ min: 0 }).withMessage('Unit price must be non-negative'),
  body('referenceNumber').optional().trim(),
  body('notes').optional().trim(),
];

export const stockOutValidators = [
  body('product').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').trim().notEmpty().withMessage('Reason is required'),
  body('referenceNumber').optional().trim(),
  body('notes').optional().trim(),
];
