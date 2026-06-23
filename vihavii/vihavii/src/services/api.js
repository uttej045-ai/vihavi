import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000, // 30 second timeout as requested
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`[Frontend API] Request: ${config.method.toUpperCase()} ${config.baseURL || ''}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Frontend API] Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[Frontend API] Response Success: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[Frontend API] Response Error:', error.message);
    
    // Handle Timeouts
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Connection Timed Out. Backend Server is taking too long to respond.');
      return Promise.reject(new Error('Connection Timed Out. Backend Server Unavailable.'));
    }
    
    // Handle Network Errors (like ERR_CONNECTION_TIMED_OUT or Server completely down)
    if (!error.response) {
      console.error('Network Error. Cannot reach the Backend Server.');
      return Promise.reject(new Error('Network Error. Backend Server Unavailable.'));
    }

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // If needed, route to login page
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
