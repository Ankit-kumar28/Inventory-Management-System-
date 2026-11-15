export class ApiResponse {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }
  static created(res, data = {}, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const response = { success: false, message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({ success: true, message, data, pagination });
  }
}
export function getPaginationParams(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
