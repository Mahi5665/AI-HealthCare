import axios from 'axios';

// Base URL for your Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const patientAPI = {
  // Get all patients (for doctors)
  getPatients: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
};

export default api;

export const aiAPI = {
  // Generate AI analysis for patient
  analyzePatient: async (patientId) => {
    const response = await api.post(`/ai/analyze/${patientId}`);
    return response.data;
  },

  // Generate treatment proposal
  generateProposal: async (patientContext, aiAnalysis) => {
    const response = await api.post('/ai/proposal', {
      patient_context: patientContext,
      ai_analysis: aiAnalysis
    });
    return response.data;
  },

  // Chat with AI
  chatWithAI: async (conversationHistory, message) => {
    const response = await api.post('/ai/chat', {
      conversation_history: conversationHistory,
      message: message
    });
    return response.data;
  },
};
