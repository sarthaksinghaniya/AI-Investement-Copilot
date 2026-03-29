import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import PriceChart from '../components/PriceChart';
import RSIChart from '../components/RSIChart';
import ProbabilityBar from '../components/ProbabilityBar';
import CopilotChat from '../components/CopilotChat';
import DecisionSummaryCard from '../components/DecisionSummaryCard';
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1440px] p-8">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">AI Trading Dashboard</h1>
            <p className="mt-1 text-gray-500">Clean, calm, and data-first market intelligence.</p>
          </div>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </header>

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 p-6 shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="xl:col-span-8">
            {stockData ? (
              <div className="space-y-8">
                <DecisionSummaryCard
                  signal={stockData.prediction?.prediction_signal || 'WATCH'}
                  expectedReturn={stockData.prediction?.expected_return_pct || 0}
                  confidence={stockData.prediction?.prediction_confidence || 0}
                  backtest={stockData.backtest || {}}
                  trend={stockData.prediction?.trend || 'SIDEWAYS'}
                />

                <PriceChart
                  historicalData={stockData.historical_data}
                  indicators={stockData.indicators}
                  futurePredictions={stockData.prediction?.future_predictions || []}
                  backtest={stockData.backtest || {}}
                />

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <RSIChart
                    historicalData={stockData.historical_data}
                    indicators={stockData.indicators}
                  />
                  <ProbabilityBar probabilities={stockData.probabilities} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-md">
                <p className="text-xl font-medium text-gray-900">No stock selected</p>
                <p className="mt-2 text-gray-500">Search for a symbol to load your dashboard.</p>
              </div>
            )}
          </div>

          <aside className="xl:col-span-4">
            <CopilotChat selectedStock={selectedStock} />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
