import api from './api';
import Cookies from 'js-cookie';
import getConfig from 'next/config';

// Get Next.js config for basePath
const { publicRuntimeConfig = {} } = getConfig() || {};
const basePath = publicRuntimeConfig.basePath || '';

// Determine if we're in static mode (GitHub Pages)
const isStaticMode = () => {
  // Check if we're on GitHub Pages
  if (typeof window !== 'undefined') {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
    return isGitHubPages || isStaticExport;
  }
  return false;
};

export const login = async (email, password) => {
  try {
    console.log('Attempting login with email:', email);
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    
    console.log('Login successful, token received:', access_token ? 'Yes (length: ' + access_token.length + ')' : 'No');
    
    if (!access_token) {
      console.error('No access token received from server');
      return {
        success: false,
        message: 'Authentication failed: No token received'
      };
    }
    
    // Store token in cookie
    Cookies.remove('token'); // Clear any existing token first
    
    Cookies.set('token', access_token, { 
      expires: 1, // 1 day
      secure: window.location.protocol === 'https:',
      sameSite: 'lax' // Changed from 'strict' to 'lax' for better compatibility
    });
    
    const storedToken = Cookies.get('token');
    console.log('Token stored in cookies:', !!storedToken);
    console.log('Stored token length:', storedToken ? storedToken.length : 0);
    
    if (!storedToken) {
      console.error('Failed to store token in cookies');
      return {
        success: false,
        message: 'Authentication failed: Unable to store token'
      };
    }
    
    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user'); // Clear existing user data
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User info stored in localStorage');
    }
    
    // Try to validate the token, but don't fail the login if it doesn't work
    try {
      console.log('Validating token after login...');
      const validationResult = await validateToken();
      console.log('Token validation result:', validationResult);
      
      if (!validationResult.success || !validationResult.valid) {
        console.warn('Token validation failed, but continuing with login.');
        // We'll continue with login anyway, as this might be a temporary backend issue
      }
    } catch (validationError) {
      console.error('Error validating token:', validationError);
      // Continue with login despite validation error
    }
    
    // Return success regardless of validation
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.error || 'Login failed',
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { access_token, user } = response.data;
    
    // Store token in cookie
    Cookies.set('token', access_token, { expires: 1 }); // 1 day
    
    // Store user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.error || 'Registration failed',
    };
  }
};

export const logout = () => {
  // Remove token from cookie
  Cookies.remove('token');
  
  // Remove user from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
  
  return { success: true };
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const isAuthenticated = () => {
  const token = Cookies.get('token');
  return !!token;
};

export const validateToken = async () => {
  let retries = 2; // Number of retries for network issues
  
  while (retries >= 0) {
    try {
      console.log('Validating token...');
      const response = await api.get('/auth/validate-token');
      console.log('Token validation response:', response.status);
      
      return { 
        success: true, 
        valid: response.data.valid,
        user: response.data.user 
      };
    } catch (error) {
      if (!error.response && retries > 0) {
        // Network error, retry
        console.warn(`Network error during token validation, retrying... (${retries} attempts left)`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        continue;
      }
      
      console.error('Token validation error:', error.message);
      console.error('Error response:', error.response?.data);
      
      // Don't automatically clear the token on validation errors in this function
      // This allows the application to handle the decision more gracefully
      
      if (error.response?.status === 401) {
        console.warn('Token is invalid or expired');
      }
      
      return {
        success: false,
        valid: false,
        status: error.response?.status,
        message: error.response?.data?.error || 'Token validation failed'
      };
    }
  }
}; 