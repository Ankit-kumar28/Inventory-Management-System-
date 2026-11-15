import { body } from 'express-validator';

export const createSupplierValidators = [
  body('supplierName').trim().notEmpty().withMessage('Supplier name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().trim(),
  body('contactPerson').optional().trim(),
  body('companyName').optional().trim(),
  body('address').optional().trim(),
];

export const updateSupplierValidators = [
  body('supplierName').optional().trim().notEmpty().withMessage('Supplier name cannot be empty'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email is required'),
];
