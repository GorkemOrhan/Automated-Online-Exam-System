import Cookies from 'js-cookie';

// Get token from cookies
export const getToken = () => {
  return Cookies.get('token');
};

// Store token in cookies
export const setToken = (token) => {
  Cookies.set('token', token, { 
    expires: 1, // 1 day
    secure: window.location.protocol === 'https:',
    sameSite: 'lax'
  });
};

// Remove token from cookies
export const removeToken = () => {
  Cookies.remove('token');
};

// Get user from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Store user in localStorage
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Remove user from localStorage
export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Logout helper
export const logout = () => {
  removeToken();
  removeUser();
}; 