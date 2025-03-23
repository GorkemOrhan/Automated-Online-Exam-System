import axios from 'axios';
import Cookies from 'js-cookie';
import getConfig from 'next/config';

// Get Next.js config
const { publicRuntimeConfig = {} } = getConfig() || {};
const basePath = publicRuntimeConfig.basePath || '';

// Use environment variables for API URL
// In production on GitHub Pages, this will be set by the GitHub Actions workflow
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    console.log('Request interceptor - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding Authorization header to request');
    } else {
      console.warn('No token found in cookies');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API connection errors (common when frontend is deployed but backend is not)
    if (!error.response) {
      console.error('API connection error:', error.message);
      // You could show a user-friendly message here
    }
    // Handle 401 Unauthorized errors
    else if (error.response.status === 401) {
      console.error('API 401 Unauthorized error:', error.response.data);
      
      // Only redirect for specific auth-related API calls, not all 401s
      // This prevents immediate redirect loops
      const isAuthRoute = error.config.url.includes('/auth/');
      const isValidatingToken = error.config.url.includes('/auth/validate-token');
      
      // Don't remove token or redirect for validation errors
      // This allows the MainLayout component to handle auth checks more gracefully
      if (!isValidatingToken) {
        console.warn('Unauthorized access (not during validation), clearing token');
        Cookies.remove('token');
        
        // Only redirect on auth routes (login/register/etc)
        if (isAuthRoute && typeof window !== 'undefined') {
          // Take into account the basePath for GitHub Pages
          const loginPath = `${window.location.origin}${basePath}/login`;
          console.log('Redirecting to login page due to auth failure');
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 