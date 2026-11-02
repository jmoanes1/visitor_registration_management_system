import axios from 'axios';
import { clearSession, readToken } from './session.js';

// Relative by default: Vite proxies /api to the Express server during
// development and the same server hosts the built app in production.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or tampered token cannot be refreshed, so start a new sign-in.
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      clearSession();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
