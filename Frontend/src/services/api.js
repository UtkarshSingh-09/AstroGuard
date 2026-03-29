import axios from 'axios';

// @FRIEND: If your backend is running elsewhere, modify the .env file!
// The base URL defaults to http://127.0.0.1:8000 if not specified in .env
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL,
  // You can add headers here if you need an auth token later
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // 1. Document Uploads
  uploadForm16: async (userId, file) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('file', file);
    return apiClient.post('/api/upload-form16', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadCAS: async (userId, password, file) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('password', password);
    formData.append('file', file);
    return apiClient.post('/api/upload-cas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // 2. Conversational Onboarding
  chat: async (userId, sessionId, message, chatHistory = []) => {
    return apiClient.post('/api/chat', {
      user_id: userId,
      session_id: sessionId,
      message,
      conversation_history: chatHistory,
    });
  },

  onboard: async (userId, sessionId, chatHistory) => {
    return apiClient.post('/api/onboard', {
      user_id: userId,
      session_id: sessionId,
      conversation_history: chatHistory,
    });
  },

  // 3. Financial Engines
  calculateFIRE: async (userId, inputs) => {
    return apiClient.post('/api/fire', {
      user_id: userId,
      inputs: inputs,
    });
  },

  runTax: async (userId, inputs = {}) => {
    return apiClient.post('/api/tax', {
      user_id: userId,
      inputs: inputs,
    });
  },

  runFIREByUser: async (userId, inputs = {}) => {
    return apiClient.post('/api/fire', {
      user_id: userId,
      inputs: inputs,
    });
  },

  runPortfolioXray: async (userId) => {
    return apiClient.post('/api/portfolio/xray', {
      user_id: userId,
    });
  },

  // 4. Market & Life Events
  simulateIntervention: async (userId, marketDropPct, sendWhatsapp = true, sendPush = true) => {
    return apiClient.post('/api/intervention/simulate', {
      user_id: userId,
      market_drop_pct: marketDropPct,
      send_whatsapp: sendWhatsapp,
      send_push: sendPush,
    });
  },

  triggerLifeEvent: async (userId, eventDescription) => {
    return apiClient.post('/api/life-event', {
      user_id: userId,
      event_description: eventDescription,
    });
  },

  // 5. User Profile (Dashboard)
  getUserProfile: async (userId) => {
    return apiClient.get(`/api/user/${userId}/profile`);
  },
};
