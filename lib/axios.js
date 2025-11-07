import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set Basic Auth for user routes
export const setBasicAuth = (phone, password) => {
  const credentials = `${phone}:${password}`;
  const token = btoa(credentials);
  api.defaults.headers.common['Authorization'] = `Basic ${token}`;
  
  // Store in localStorage AND set cookie
  localStorage.setItem('basicAuth', token);
  document.cookie = `basicAuth=${token}; path=/; max-age=86400`;
  document.cookie = `phone=${phone}; path=/; max-age=86400`;
};

// Clear Basic Auth
export const clearAuth = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('basicAuth');
  document.cookie = 'basicAuth=; path=/; max-age=0';
  document.cookie = 'phone=; path=/; max-age=0';
};

// Restore auth from localStorage on app load
export const restoreAuth = () => {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('basicAuth');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Basic ${token}`;
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('basicAuth');
      if (token) {
        config.headers.Authorization = `Basic ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
