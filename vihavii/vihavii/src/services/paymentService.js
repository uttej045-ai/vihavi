import api from './api';

const paymentService = {
  createOrder: async (orderData) => {
    // In a real app this creates a Razorpay order on the backend
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    // Verifies the Razorpay signature
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },
  getPaymentHistory: async () => {
    const response = await api.get('/payments');
    return response.data;
  }
};

export default paymentService;
