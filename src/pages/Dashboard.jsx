import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import StockCard from '../components/StockCard';
import PriceChart from '../components/PriceChart';
import RSIChart from '../components/RSIChart';
import ProbabilityBar from '../components/ProbabilityBar';
import CopilotChat from '../components/CopilotChat';
import AlertsPanel from '../components/AlertsPanel';
import { stockAPI } from '../services/api';

const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (symbol) => {
    if (!symbol || symbol === selectedStock) return;

    setSelectedStock(symbol);
    setLoading(true);
    setError(null);

    try {
      const data = await stockAPI.getStock(symbol);
      setStockData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(`Failed to fetch data for ${symbol}. Please check the symbol and try again.`);
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Investment Copilot</h1>
          <p className="text-gray-400">Smart stock analysis powered by artificial intelligence</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stock Card */}
              {stockData ? (
                <StockCard stockData={stockData} />
              ) : (
                <div className="bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-700 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">No stock selected</p>
                    <p className="text-sm">Search for a stock symbol to start analyzing</p>
                  </div>
                </div>
              )}

              {/* Charts */}
              {stockData && (
                <>
                  <PriceChart 
                    historicalData={stockData.historical_data} 
                    indicators={stockData.indicators} 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RSIChart indicators={stockData.indicators} />
                    <ProbabilityBar probabilities={stockData.probabilities} />
                  </div>
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Alerts Panel */}
              <AlertsPanel />
              
              {/* Copilot Chat */}
              <CopilotChat selectedStock={selectedStock} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
