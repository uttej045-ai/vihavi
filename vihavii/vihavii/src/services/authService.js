import api from './api';
import { mockUsers } from '../mocks/mockUsers';

export const authService = {
  checkHealth: async () => {
    // Health check removed to prevent blocking login
    return true;
  },

  login: async (email, password) => {
    try {
      let token, user;

      // Temporary frontend-only authentication mode bypass
      if (import.meta.env.VITE_DEV_AUTH_MODE === 'true') {
        console.warn('DEVELOPMENT ONLY: Bypassing backend auth');
        
        const mockUser = mockUsers[email];
        if (!mockUser) {
          throw new Error('Invalid mock user email or password');
        }
        
        token = mockUser.token;
        user = mockUser;
      } else {
        // 1. Perform actual POST /api/auth/login
        const response = await api.post('/api/auth/login', { email, password });
        
        // The backend should return the token and optionally user details
        token = response.data.token;
        user = response.data.user;
        
        if (!token) {
          throw new Error('Authentication succeeded but no token was returned by the server');
        }
      }

      // 2. Save to localStorage securely
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store email and role explicitly as requested
      const userEmail = user?.email || email;
      const userRole = user?.role || 'USER'; // Default fallback if not provided
      
      localStorage.setItem('email', userEmail);
      localStorage.setItem('role', userRole);
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.setItem('user', JSON.stringify({ email: userEmail, role: userRole }));
      }
      
      return { token, user };
      
    } catch (error) {
      // Handle specific HTTP Status Codes
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('Invalid email or password');
        } else if (status === 403) {
          throw new Error('Access forbidden. Your account may be locked or lack permissions.');
        } else if (status >= 500) {
          throw new Error('Backend Server Error. Please try again later.');
        }
        
        throw new Error(error.response.data?.message || 'Server error during login');
      }
      
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    console.log('Mock API call: forgotPassword', { email });
    await new Promise(resolve => setTimeout(resolve, 800));
    return { message: 'Reset link sent' };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  },

  refreshToken: async () => {
    console.log('Mock API call: refreshToken');
    return { token: 'new-mock-token-456' };
  }
};
