import mongoose from 'mongoose';
import { ApiResponse } from './apiResponse.js';
export function isValidObjectId(id) { return mongoose.Types.ObjectId.isValid(id); }
export function validateObjectId(res, id, fieldName = 'ID') {
  if (!isValidObjectId(id)) { ApiResponse.error(res, `Invalid ${fieldName} format`, 400); return false; }
  return true;
}
