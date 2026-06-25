import { dbService } from './dbService';

export const authService = {
  checkHealth: async () => {
    return true;
  },

  login: async (email, password) => {
    try {
      // Fetch users from dbService
      const users = await dbService.getAll('users');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password (simple check since it is development/mock server)
      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Generate a mock token
      const token = `mock-jwt-token-${user.role.toLowerCase()}-${user.id}`;

      // Save to localStorage securely
      localStorage.setItem('token', token);
      localStorage.setItem('isAuthenticated', 'true');
      
      const userEmail = user.email;
      const roleLower = user.role.toLowerCase();
      const userRole = roleLower === 'organizer' ? 'organizer' : roleLower === 'admin' ? 'admin' : 'user';
      
      localStorage.setItem('email', userEmail);
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('role', user.role.toUpperCase()); 
      localStorage.setItem('user', JSON.stringify({ id: user.id, email: userEmail, role: user.role, name: user.name }));
      
      return { token, user };
    } catch (error) {
      console.error('[AuthService] Login Error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const users = await dbService.getAll('users');
      const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      
      if (exists) {
        throw new Error('Email is already registered');
      }

      // Add to users database
      const newUser = {
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        role: (userData.userType || userData.role || 'USER').toUpperCase()
      };

      const createdUser = await dbService.create('users', newUser);

      // If user is organizer, also create an organizer details record
      if (createdUser.role === 'ORGANIZER') {
        const newOrg = {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          phone: userData.phone || '+91 98765 43210',
          location: userData.location || 'Hyderabad, India',
          about: 'Premium Event Organizer',
          logo: '',
          website: '',
          twitter: '',
          linkedin: ''
        };
        await dbService.create('organizers', newOrg);
      }

      return { success: true, user: createdUser };
    } catch (error) {
      console.error('[AuthService] Registration Error:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    const users = await dbService.getAll('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('No account found with this email address');
    }

    // Save recovery status in localstorage
    localStorage.setItem('reset_email', email);
    
    // Add mock notification to database
    await dbService.create('notifications', {
      type: 'system',
      message: `Password reset requested for ${email}`,
      timestamp: new Date().toISOString(),
      read: false
    });

    return { message: 'Reset link sent' };
  },

  resetPassword: async (newPassword) => {
    const resetEmail = localStorage.getItem('reset_email');
    if (!resetEmail) {
      throw new Error('Session expired. Please request password reset again.');
    }

    const users = await dbService.getAll('users');
    const user = users.find(u => u.email.toLowerCase() === resetEmail.toLowerCase());
    if (!user) {
      throw new Error('User not found.');
    }

    user.password = newPassword;
    await dbService.update('users', user.id, user);
    
    localStorage.removeItem('reset_email');

    // Add mock notification
    await dbService.create('notifications', {
      type: 'system',
      message: `Password reset successfully for ${resetEmail}`,
      timestamp: new Date().toISOString(),
      read: false
    });

    return { success: true };
  },

  verifyEmail: async (token) => {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Email verified successfully.' };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    window.location.href = '/login';
  },

  refreshToken: async () => {
    return { token: 'new-mock-token-456' };
  }
};
