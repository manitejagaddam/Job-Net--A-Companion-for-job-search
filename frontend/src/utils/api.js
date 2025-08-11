import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updatePassword: (data) => api.put('/profile/password', data),
  connectWallet: (wallet) => api.post('/profile/wallet', { wallet }),
  getUserById: (id) => api.get(`/profile/${id}`),
  searchUsers: (params) => api.get('/profile/search', { params }),
};

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getUserJobs: () => api.get('/jobs/user/my'),
};

// Payments API
export const paymentsAPI = {
  getRequirements: () => api.get('/payments/requirements'),
  initiatePayment: (data) => api.post('/payments/initiate', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPaymentHistory: () => api.get('/payments/history'),
  checkPaymentStatus: (jobId) => api.get(`/payments/status/${jobId}`),
};

// AI API
export const aiAPI = {
  extractSkills: (text) => api.post('/ai/extract-skills', { text }),
  calculateJobMatch: (jobId) => api.get(`/ai/match/${jobId}`),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  updateSkillsFromText: (text) => api.post('/ai/update-skills', { text }),
  getSimilarJobs: (jobId, params) => api.get(`/ai/similar/${jobId}`, { params }),
};

export default api; 