import api from './api';

const profileService = {
  getProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/profiles/me', profileData);
    return response.data;
  },
  updatePassword: async (passwordData) => {
    const response = await api.post('/profiles/me/password', passwordData);
    return response.data;
  }
};

export default profileService;
