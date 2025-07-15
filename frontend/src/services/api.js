import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('fraudDetectionUser');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// User Authentication API
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/register', userData),
  
  // Login user
  login: (credentials) => api.post('/login', credentials),
  
  // Get current user info
  getCurrentUser: () => api.get('/user'),
  
  // Get all users (admin only)
  getAllUsers: () => api.get('/users'),
};

// Fraud Detection API
export const fraudDetectionAPI = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Model training
  trainModel: (data) => api.post('/train', { data }),
  trainFromCSV: () => api.post('/train-from-csv'),

  // Fraud prediction
  predictFraud: (transactions) => api.post('/predict', { transactions }),

  // Get model info
  getModelInfo: () => api.get('/model-info'),

  // Get sample data
  getSampleData: () => api.get('/sample-data'),
  getSamplePredictions: () => api.get('/sample-predictions'),

  // Get dataset info
  getDatasetInfo: () => api.get('/dataset-info'),
};

export default api; 