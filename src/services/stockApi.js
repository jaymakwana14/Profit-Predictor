import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

class StockApiService {
  // Fetch stock categories
  async getStockCategories() {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  }

  // Fetch stocks for a category
  async getStocks(category) {
    const response = await axios.get(`${API_BASE_URL}/stocks/${category}`);
    return response.data;
  }

  // Search stocks in a category
  async searchStocks(category, query) {
    if (!query) return [];
    const response = await axios.get(`${API_BASE_URL}/search-stocks/${category}/${query}`);
    return response.data;
  }

  // Fetch stock data for prediction
  async getStockData(category, symbol) {
    const response = await axios.get(`${API_BASE_URL}/stock-data`, {
      params: { category, symbol }
    });
    return response.data;
  }
}

export const stockApi = new StockApiService();
