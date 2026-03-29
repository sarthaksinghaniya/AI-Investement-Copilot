import React from 'react';

const DecisionSummaryCard = ({
  signal = 'WATCH',
  expectedReturn = 0,
  confidence = 0,
  backtest = null,
  trend = 'SIDEWAYS'
}) => {
  const getSignalColor = () => {
    switch (signal.toUpperCase()) {
      case 'BUY':
        return 'text-green-600';
      case 'SELL':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getReturnColor = () => {
    return expectedReturn >= 0 ? 'text-green-600' : 'text-red-500';
  };

  const formatTrend = () => {
    if (!trend) return 'Sideways';
    const value = trend.toString().toUpperCase();
    if (value === 'UP') return 'Uptrend';
    if (value === 'DOWN') return 'Downtrend';
    return 'Sideways';
  };

  const getActionText = () => {
    const value = signal.toUpperCase();
    if (value === 'BUY') return 'Enter Position';
    if (value === 'SELL') return 'Trim Position';
    return 'Hold Position';
  };

  const backtestSummary = () => {
    if (!backtest || !backtest.return_pct) return null;
    const pct = Number(backtest.return_pct);
    if (!Number.isFinite(pct)) return null;
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% backtest`;
  };

  const formattedReturn = `${expectedReturn >= 0 ? '+' : ''}${Number(expectedReturn).toFixed(1)}%`;
  const confidencePct = `${Math.round(confidence * 100)}%`;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">Decision</p>
        <h2 className={`mt-2 text-6xl font-semibold leading-none ${getSignalColor()}`}>{signal.toUpperCase()}</h2>
        <p className={`mt-3 text-3xl font-semibold ${getReturnColor()}`}>{formattedReturn}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Confidence</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{confidencePct}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Trend</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{formatTrend()}</p>
          </div>
        </div>

        <button className="mt-8 cursor-pointer rounded-2xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-black hover:scale-[1.03] active:scale-[0.97]">
          {getActionText()}
        </button>

        {backtestSummary() && (
          <p className="mt-3 text-sm text-gray-500">{backtestSummary()}</p>
        )}
      </div>
    </div>
  );
};

export default DecisionSummaryCard;
