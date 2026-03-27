import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const stockAPI = {
  getStock: async (symbol) => {
    try {
      const response = await api.get(`/stock/${symbol}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw error;
    }
  }
};

export const copilotAPI = {
  chat: async (query, stock) => {
    try {
      const response = await api.post('/copilot/chat', {
        query,
        stock
      });
      return response.data;
    } catch (error) {
      console.error('Error in copilot chat:', error);
      throw error;
    }
  }
};

export const alertsAPI = {
  getAlerts: async () => {
    try {
      const response = await api.get('/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }
};

export default api;
