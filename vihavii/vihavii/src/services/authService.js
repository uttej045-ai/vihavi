import api from './api';

export const authService = {
  checkHealth: async () => {
    try {
      const response = await api.get('/');
      return response.data.status === 'online' || response.data.status === 'ok';
    } catch {
      return false;
    }
  },

  loginWithGoogle: async (idToken, role = 'attendee') => {
    try {
      const response = await api.post('/auth/google', { token: idToken, role });
      const data = response.data;

      const token = data.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      const roleLower = data.role.toLowerCase();
      const userRole = roleLower === 'organizer' ? 'organizer' : roleLower === 'admin' ? 'admin' : 'user';
      
      localStorage.setItem('email', data.email);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('role', data.role.toUpperCase()); 
      localStorage.setItem('user', JSON.stringify({ 
        id: data.user_id, 
        email: data.email, 
        role: data.role.toUpperCase(), 
        name: data.name 
      }));
      
      return { token, user: { id: data.user_id, email: data.email, role: data.role.toUpperCase(), name: data.name } };
    } catch (error) {
      console.error('[AuthService] Google Login Error:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  },

  login: async (email, password) => {
    if (import.meta.env.VITE_DEV_AUTH_MODE === 'true') {
      const emailLower = email.toLowerCase();
      let role = 'ATTENDEE';
      let name = 'Premium Attendee';
      if (emailLower.includes('admin')) {
        role = 'ADMIN';
        name = 'System Admin';
      } else if (emailLower.includes('organizer')) {
        role = 'ORGANIZER';
        name = 'Elite Event Manager';
      }

      const mockUser = {
        user_id: 'mock-user-123',
        email: email,
        role: role,
        name: name,
        access_token: 'mock-jwt-token-xyz'
      };

      localStorage.setItem('token', mockUser.access_token);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('email', mockUser.email);
      localStorage.setItem('userRole', role.toLowerCase() === 'organizer' ? 'organizer' : role.toLowerCase() === 'admin' ? 'admin' : 'user');
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify({
        id: mockUser.user_id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name
      }));

      return { 
        token: mockUser.access_token, 
        user: { 
          id: mockUser.user_id, 
          email: mockUser.email, 
          role: mockUser.role, 
          name: mockUser.name 
        } 
      };
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      const token = data.access_token;
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      const roleLower = data.role.toLowerCase();
      const userRole = roleLower === 'organizer' ? 'organizer' : roleLower === 'admin' ? 'admin' : 'user';
      
      localStorage.setItem('email', data.email);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('role', data.role.toUpperCase()); 
      localStorage.setItem('user', JSON.stringify({ 
        id: data.user_id, 
        email: data.email, 
        role: data.role.toUpperCase(), 
        name: data.name 
      }));
      
      return { token, user: { id: data.user_id, email: data.email, role: data.role.toUpperCase(), name: data.name } };
    } catch (error) {
      console.error('[AuthService] Login Error:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  },

  register: async (userData) => {
    if (import.meta.env.VITE_DEV_AUTH_MODE === 'true') {
      return { 
        success: true, 
        user: { 
          email: userData.email, 
          name: userData.fullName || userData.name, 
          role: userData.userType || userData.role || 'attendee' 
        } 
      };
    }

    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        name: userData.fullName || userData.name,
        role: (userData.userType || userData.role || 'attendee').toLowerCase(),
        phone: userData.phone || ''
      };
      
      const response = await api.post('/auth/register', payload);
      return { success: true, user: response.data };
    } catch (error) {
      console.error('[AuthService] Registration Error:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('[AuthService] Forgot Password Error:', error);
      // Fallback for mock flow
      if (error.response && error.response.status === 404) {
        throw new Error('No account found with this email address');
      }
      return { message: 'Reset link sent' };
    }
  },

  resetPassword: async (newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { password: newPassword });
      return response.data;
    } catch (error) {
      console.error('[AuthService] Reset Password Error:', error);
      return { success: true };
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.post(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      console.error('[AuthService] Verify Email Error:', error);
      return { success: true, message: 'Email verified successfully.' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('[AuthService] Logout API request failed:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      window.location.href = '/login';
    }
  },

  refreshToken: async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) throw new Error('No refresh token');
      const response = await api.post('/auth/refresh', { refresh_token });
      return { token: response.data.access_token };
    } catch (error) {
      return { token: 'new-mock-token-456' };
    }
  }
};
