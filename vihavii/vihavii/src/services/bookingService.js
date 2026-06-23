import api from './api';

const bookingService = {
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  getRecentBookings: async () => {
    const response = await api.get('/recentBookings');
    return response.data;
  }
};

export default bookingService;
