import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ecochain-epiu.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Attach the JWT to every outgoing request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecochain_token');
  if (token) {
    config.headers.Authorization = token; // already stored as "Bearer <token>"
  }
  return config;
});

// If the backend ever returns 401, the token is invalid/expired — clear it
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecochain_token');
      localStorage.removeItem('ecochain_user');
    }
    return Promise.reject(error);
  }
);

export default api;