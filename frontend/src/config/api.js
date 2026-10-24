import axios from 'axios';
import { encryptData, decryptData } from './crypto';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.PROD ? 'https://ecochain-epiu.onrender.com' : 'http://localhost:3001');

// Encryption key — loaded from env for the shared-secret E2E channel
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || null;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Request Interceptor ────────────────────────────────────────────────
// Attach JWT + optionally encrypt the request body for sensitive endpoints
api.interceptors.request.use(async (config) => {
  // Always attach JWT
  const token = localStorage.getItem('ecochain_token');
  if (token) {
    config.headers.Authorization = token; // stored as "Bearer <token>"
  }

  // E2E encrypt POST/PUT request bodies when encryption key is available
  if (ENCRYPTION_KEY && config.data && ['post', 'put'].includes(config.method)) {
    try {
      const payload = await encryptData(JSON.stringify(config.data), ENCRYPTION_KEY);
      config.data = { encrypted: true, payload };
      // Signal backend to encrypt its response too
      config.headers['x-request-encrypted'] = 'true';
    } catch (err) {
      // If encryption fails, fall through with plaintext — don't block the user
      console.warn('⚠️ E2E encryption skipped:', err.message);
    }
  }

  return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────
// Handle 401 redirects + decrypt encrypted responses
api.interceptors.response.use(
  async (response) => {
    // Decrypt if the server encrypted the response
    if (ENCRYPTION_KEY && response.data?.encrypted === true && response.data?.payload) {
      try {
        const decrypted = JSON.parse(await decryptData(response.data.payload, ENCRYPTION_KEY));
        response.data = decrypted;
      } catch (err) {
        console.warn('⚠️ E2E decryption failed:', err.message);
        // Return the raw response so the caller can decide
      }
    }
    return response;
  },
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