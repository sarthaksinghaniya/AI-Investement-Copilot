import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Utility function to normalize stock symbols for Indian stocks
const normalizeStockSymbol = (symbol) => {
  if (!symbol) return symbol;

  symbol = symbol.toUpperCase().trim();

  // If symbol already has a suffix, return as-is
  if (symbol.includes('.')) {
    return symbol;
  }

  // Known Indian stock symbols that need .NS suffix
  const indianStocks = new Set([
    'TCS', 'INFY', 'RELIANCE', 'HDFCBANK', 'ICICI', 'HDFC', 'ITC', 'LT', 'BAJAJ',
    'MARUTI', 'AXISBANK', 'KOTAKBANK', 'BHARTIARTL', 'WIPRO', 'HINDUNILVR',
    'NESTLEIND', 'ULTRACEMCO', 'POWERGRID', 'NTPC', 'ONGC', 'COALINDIA', 'GAIL'
  ]);

  // Add .NS suffix for known Indian stocks
  if (indianStocks.has(symbol)) {
    return `${symbol}.NS`;
  }

  // For other symbols (US, international), return as-is
  return symbol;
};

export const stockAPI = {
  getStock: async (symbol) => {
    try {
      const normalizedSymbol = normalizeStockSymbol(symbol);
      const response = await api.get(`/stock/${normalizedSymbol}`);
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
        stock: stock || null
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
      return response.data || [];
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  }
};

export default api;
