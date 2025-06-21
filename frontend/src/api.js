import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor para añadir el token JWT si existe
api.interceptors.request.use((config) => {
  console.log('API Interceptor: Processing request to', config.url);
  const token = localStorage.getItem('token');
  console.log('API Interceptor: Token exists?', !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Interceptor: Added token to request');
  } else {
    console.warn('API Interceptor: No token found in localStorage');
  }
  
  return config;
}, (error) => {
  console.error('API Interceptor: Request error:', error);
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('API Interceptor: Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('API Interceptor: Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api; 