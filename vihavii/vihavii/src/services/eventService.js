import api from './api';

const eventService = {
  getEvents: async (params) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getRecommendedEvents: async () => {
    const response = await api.get('/recommendedEvents');
    return response.data;
  }
};

export default eventService;
