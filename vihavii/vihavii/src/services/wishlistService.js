import api from './api';

const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },
  addToWishlist: async (eventData) => {
    const response = await api.post('/wishlist', eventData);
    return response.data;
  },
  removeFromWishlist: async (id) => {
    const response = await api.delete(`/wishlist/${id}`);
    return response.data;
  }
};

export default wishlistService;
