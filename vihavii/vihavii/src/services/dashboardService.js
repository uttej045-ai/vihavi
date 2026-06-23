import api from './api';

const dashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboardStats');
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error) {
      console.warn('Failed to fetch dashboard stats, returning fallback data', error);
      return { totalBookings: 0, amountSpent: 0 };
    }
  },
  getDashboardData: async () => {
    // Execute multiple calls independently to prevent one failure from crashing the whole dashboard
    const [statsResult, recommendedResult, bookingsResult] = await Promise.allSettled([
      api.get('/dashboardStats'),
      api.get('/recommendedEvents'),
      api.get('/recentBookings')
    ]);
    
    // Process Stats
    let stats = { totalBookings: 0, amountSpent: 0 };
    if (statsResult.status === 'fulfilled') {
      stats = Array.isArray(statsResult.value.data) ? statsResult.value.data[0] : statsResult.value.data;
    } else {
      console.warn('Stats API failed (Likely 403 in Dev Mode), using fallback data');
    }

    // Process Recommended Events
    let recommended = [];
    if (recommendedResult.status === 'fulfilled') {
      recommended = recommendedResult.value.data || [];
    } else {
      console.warn('Recommended Events API failed (Likely 403 in Dev Mode), using fallback empty array');
    }

    // Process Recent Bookings
    let upcomingBookings = [];
    if (bookingsResult.status === 'fulfilled') {
      upcomingBookings = bookingsResult.value.data || [];
    } else {
      console.warn('Recent Bookings API failed, using fallback empty array');
    }
    
    return {
      stats,
      recommended,
      upcomingBookings
    };
  }
};

export default dashboardService;
