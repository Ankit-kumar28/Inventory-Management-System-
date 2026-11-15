import { body } from 'express-validator';

export const createProductValidators = [
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('supplier').isMongoId().withMessage('Valid supplier ID is required'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be a non-negative number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a non-negative number'),
  body('minimumStockLevel').optional().isFloat({ min: 0 }).withMessage('Minimum stock level must be non-negative'),
  body('unit').optional().trim(),
  body('description').optional().trim(),
];

export const updateProductValidators = [
  body('productName').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('supplier').optional().isMongoId().withMessage('Valid supplier ID is required'),
  body('purchasePrice').optional().isFloat({ min: 0 }).withMessage('Purchase price must be non-negative'),
  body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be non-negative'),
  body('minimumStockLevel').optional().isFloat({ min: 0 }).withMessage('Minimum stock level must be non-negative'),
  body('unit').optional().trim(),
  body('description').optional().trim(),
];
