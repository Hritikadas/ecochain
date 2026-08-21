import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecochain_token');
  if (token) {
    config.headers.Authorization = token; // stored as "Bearer <token>"
  }
  return config;
});

// Handle 401 responses — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecochain_token');
      localStorage.removeItem('ecochain_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;