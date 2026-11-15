import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 and not already on /login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentTransactions: (limit = 10) =>
    api.get('/dashboard/recent-transactions', { params: { limit } }),
  getStockOverview: () => api.get('/dashboard/stock-overview'),
};

// Products
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers
export const suppliersApi = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

// Inventory
export const inventoryApi = {
  getAll: (params) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getOutOfStock: () => api.get('/inventory/out-of-stock'),
};

// Transactions
export const transactionsApi = {
  stockIn: (data) => api.post('/transactions/stock-in', data),
  stockOut: (data) => api.post('/transactions/stock-out', data),
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
};

// Reports
export const reportsApi = {
  getInventory: (params) => api.get('/reports/inventory', { params }),
  getStockIn: (params) => api.get('/reports/stock-in', { params }),
  getStockOut: (params) => api.get('/reports/stock-out', { params }),
  getTransactions: (params) => api.get('/reports/transactions', { params }),
  getLowStock: (params) => api.get('/reports/low-stock', { params }),
  getValuation: (params) => api.get('/reports/valuation', { params }),
  exportCsv: (endpoint, params) =>
    api.get(endpoint, {
      params: { ...params, export: 'csv' },
      responseType: 'blob',
    }),
};

// Users
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/status`),
  getActivityLogs: (params) => api.get('/users/activity-logs', { params }),
};

export default api;
