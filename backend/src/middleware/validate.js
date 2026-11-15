import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/apiResponse.js';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(
      res,
      'Validation failed',
      400,
      errors.array().map((e) => e.msg)
    );
  }
  next();
}
