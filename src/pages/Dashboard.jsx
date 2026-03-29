import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import PriceChart from '../components/PriceChart';
import RSIChart from '../components/RSIChart';
import ProbabilityBar from '../components/ProbabilityBar';
import CopilotChat from '../components/CopilotChat';
import AIExplanationCard from '../components/AIExplanationCard';
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

  const signal = stockData?.prediction?.prediction_signal?.toUpperCase() || 'WATCH';
  const expectedReturn = Number(stockData?.prediction?.expected_return_pct ?? 0);
  const confidence = Math.round(Number(stockData?.prediction?.prediction_confidence ?? 0) * 100);
  const trendRaw = stockData?.prediction?.trend?.toUpperCase() || 'SIDEWAYS';
  const trend = trendRaw === 'UP' ? 'Uptrend' : trendRaw === 'DOWN' ? 'Downtrend' : 'Sideways';

  const signalColor = signal === 'BUY' ? 'text-green-500' : signal === 'SELL' ? 'text-red-500' : 'text-gray-400';
  const returnColor = expectedReturn >= 0 ? 'text-green-500' : 'text-red-500';
  const ctaLabel = signal === 'BUY' ? 'Enter Position' : signal === 'SELL' ? 'Reduce Exposure' : 'Hold Position';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="space-y-6 text-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">AI Trading Dashboard</h1>
            <p className="mt-2 text-gray-500">Premium market intelligence in a clean, focused workspace.</p>
          </div>
          <div className="mx-auto max-w-2xl">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </header>

        {error && (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-10">
            {stockData ? (
              <>
                <section className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">Decision</p>
                  <h2 className={`mt-3 text-5xl font-semibold ${signalColor}`}>{signal}</h2>
                  <p className={`mt-4 text-3xl font-semibold ${returnColor}`}>
                    {expectedReturn >= 0 ? '+' : ''}
                    {expectedReturn.toFixed(1)}%
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                    <span>
                      Confidence: <span className="font-semibold text-gray-900">{confidence}%</span>
                    </span>
                    <span>
                      Trend: <span className="font-semibold text-gray-900">{trend}</span>
                    </span>
                  </div>

                  <button className="mt-8 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-medium text-white">
                    {ctaLabel}
                  </button>
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-6">
                  <PriceChart
                    historicalData={stockData.historical_data}
                    indicators={stockData.indicators}
                    futurePredictions={stockData.prediction?.future_predictions || []}
                    backtest={stockData.backtest || {}}
                  />
                </section>

                <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <RSIChart
                      historicalData={stockData.historical_data}
                      indicators={stockData.indicators}
                    />
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <ProbabilityBar probabilities={stockData.probabilities} />
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <p className="text-xl font-medium text-gray-900">No stock selected</p>
                <p className="mt-2 text-gray-500">Search for a symbol to load your dashboard.</p>
              </div>
            )}
          </div>

          <aside className="xl:col-span-4 space-y-8">
            {stockData?.ai_explanation && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <AIExplanationCard explanation={stockData.ai_explanation} />
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <AlertsPanel />
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <CopilotChat selectedStock={selectedStock} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
