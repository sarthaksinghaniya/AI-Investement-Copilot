import React, { useEffect, useState } from 'react';
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
  const [displayReturn, setDisplayReturn] = useState(0);

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

  const signalColor = signal === 'BUY' ? 'text-green-600' : signal === 'SELL' ? 'text-red-500' : 'text-gray-400';
  const returnColor = expectedReturn >= 0 ? 'text-green-600' : 'text-red-500';
  const ctaLabel = signal === 'BUY' ? 'Enter Position' : signal === 'SELL' ? 'Reduce Exposure' : 'Hold Position';

  useEffect(() => {
    let start = 0;
    const end = expectedReturn;
    const duration = 500;
    const steps = Math.max(1, Math.floor(duration / 16));
    const increment = (end - start) / steps;

    const counter = setInterval(() => {
      start += increment;
      const done = increment >= 0 ? start >= end : start <= end;
      if (done) {
        setDisplayReturn(end);
        clearInterval(counter);
        return;
      }
      setDisplayReturn(start);
    }, 16);

    return () => clearInterval(counter);
  }, [expectedReturn]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-12 px-6 py-6">
        <header className="space-y-4 text-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">AI Trading Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500">Premium market intelligence in a clean, focused workspace.</p>
          </div>
          <div className="mx-auto max-w-2xl">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
        </header>

        {error && (
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-12">
            {loading && !stockData ? (
              <div className="animate-pulse space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="h-6 w-1/3 rounded bg-gray-200"></div>
                <div className="h-40 rounded bg-gray-200"></div>
              </div>
            ) : stockData ? (
              <>
                <section className="mx-auto max-w-xl cursor-pointer rounded-3xl bg-white p-8 text-center shadow-sm animate-fade-in-up transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">Decision</p>
                  <h2 className={`mt-3 text-5xl font-semibold ${signalColor}`}>{signal}</h2>
                  <p className={`mt-4 text-3xl font-semibold ${returnColor}`}>
                    {displayReturn >= 0 ? '+' : ''}
                    {displayReturn.toFixed(1)}%
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                    <span>
                      Confidence: <span className="font-semibold text-gray-900">{confidence}%</span>
                    </span>
                    <span>
                      Trend: <span className="font-semibold text-gray-900">{trend}</span>
                    </span>
                  </div>

                  <button className="mt-8 cursor-pointer px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-medium transition-all duration-200 hover:bg-black hover:scale-[1.03] active:scale-[0.97]">
                    {ctaLabel}
                  </button>
                </section>

                <section className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px] animate-fade-in">
                  <PriceChart
                    historicalData={stockData.historical_data}
                    indicators={stockData.indicators}
                    futurePredictions={stockData.prediction?.future_predictions || []}
                    backtest={stockData.backtest || {}}
                  />
                </section>

                <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
                    <RSIChart
                      historicalData={stockData.historical_data}
                      indicators={stockData.indicators}
                    />
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
                    <ProbabilityBar probabilities={stockData.probabilities} />
                  </div>
                </section>
              </>
            ) : (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm transition-all duration-200 ease-out">
                <p className="text-xl font-medium text-gray-900">No stock selected</p>
                <p className="mt-2 text-sm text-gray-500">Search for a symbol to load your dashboard.</p>
              </div>
            )}
          </div>

          <aside className="xl:col-span-4 space-y-8">
            {stockData?.ai_explanation && (
              <div className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
                <AIExplanationCard explanation={stockData.ai_explanation} />
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
              <AlertsPanel />
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
              <CopilotChat selectedStock={selectedStock} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
