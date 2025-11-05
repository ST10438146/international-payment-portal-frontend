import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log("🔗 Using API base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Payment APIs
export const paymentAPI = {
  create: (paymentData) => api.post('/payments', paymentData),
  getMyPayments: () => api.get('/payments/my-payments'),
  getAllPayments: (status) => api.get('/payments/all', { params: { status } }),
  verifyPayment: (id) => api.put(`/payments/${id}/verify`),
  submitToSwift: (paymentIds) => api.post('/payments/submit-swift', { paymentIds }),
};

export default api;