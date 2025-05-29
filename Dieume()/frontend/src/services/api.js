import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't redirect on 401 errors, let components handle them
    // This prevents infinite reload loops
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Spare Parts API
export const sparePartsAPI = {
  create: (data) => api.post('/spare-parts', data),
  getAll: () => api.get('/spare-parts'),
};

// Stock In API
export const stockInAPI = {
  create: (data) => api.post('/stock-in', data),
  getAll: () => api.get('/stock-in'),
};

// Stock Out API
export const stockOutAPI = {
  getAll: () => api.get('/stock-out'),
  create: (data) => api.post('/stock-out', data),
  update: (id, data) => api.put(`/stock-out/${id}`, data),
  delete: (id) => api.delete(`/stock-out/${id}`),
};

// Reports API
export const reportsAPI = {
  dailyStockOut: (date) => api.get(`/reports/daily-stock-out?date=${date}`),
  dailyStockStatus: (date) => api.get(`/reports/daily-stock-status?date=${date}`),
  stockMovementSummary: (startDate, endDate) =>
    api.get(`/reports/stock-movement-summary?startDate=${startDate}&endDate=${endDate}`),
};

export default api;
