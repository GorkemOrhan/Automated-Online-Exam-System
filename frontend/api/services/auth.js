import api from './api';
import Cookies from 'js-cookie';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
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