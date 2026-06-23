import api from './api';

const ticketService = {
  getTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },
  getTicketById: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
  getQrTickets: async () => {
    const response = await api.get('/qrTickets');
    return response.data;
  }
};

export default ticketService;
