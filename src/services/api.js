import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: true, // Send cookies with requests
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format before sending
      if (token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Invalid token format, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Invalid token format'));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    const { status } = error.response;
    const requestUrl = error.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // Handle unauthorized (401) - token expired or invalid
    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle forbidden (403) - insufficient permissions
    if (status === 403) {
      console.error('Access forbidden:', error.response.data?.message);
    }

    // Handle rate limiting (429)
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.error('Rate limit exceeded. Retry after:', retryAfter);
      return Promise.reject(new Error('Too many requests. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

export default api;
