import React from 'react';

const DecisionSummaryCard = ({ 
  signal = 'WATCH', 
  expectedReturn = 0, 
  confidence = 0, 
  backtest = null,
  trend = 'SIDEWAYS'
}) => {
  // Color coding based on signal
  const getSignalColor = () => {
    switch (signal.toUpperCase()) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSignalBg = () => {
    switch (signal.toUpperCase()) {
      case 'BUY': return 'bg-green-900/20 border-green-600';
      case 'SELL': return 'bg-red-900/20 border-red-600';
      default: return 'bg-yellow-900/20 border-yellow-600';
    }
  };

  const getReturnColor = () => {
    return expectedReturn >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = () => {
    switch (trend.toUpperCase()) {
      case 'UP': return '📈';
      case 'DOWN': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = () => {
    switch (trend.toUpperCase()) {
      case 'UP': return 'text-green-400';
      case 'DOWN': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Format backtest result
  const getBacktestDisplay = () => {
    if (!backtest || !backtest.final_value) return 'No backtest data';
    
    const { final_value = 100000, return_pct = 0 } = backtest;
    const returnColor = return_pct >= 0 ? 'text-green-400' : 'text-red-400';
    const returnSign = return_pct >= 0 ? '+' : '';
    
    return (
      <span className={returnColor}>
        ₹100K → ₹{final_value.toLocaleString()} ({returnSign}{return_pct}%)
      </span>
    );
  };

  return (
    <div className="flex justify-center items-center min-h-[200px] p-6">
      <div className={`bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 max-w-md w-full ${getSignalBg()}`}>
        {/* Main Signal */}
        <div className="text-center mb-6">
          <div className={`text-5xl font-bold mb-2 ${getSignalColor()}`}>
            {signal.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">
            Trading Signal
          </div>
        </div>

        {/* Expected Return */}
        <div className="text-center mb-4">
          <div className={`text-3xl font-semibold ${getReturnColor()}`}>
            {expectedReturn >= 0 ? '+' : ''}{expectedReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">
            Expected Return
          </div>
        </div>

        {/* Confidence */}
        <div className="text-center mb-4">
          <div className="text-2xl font-semibold text-blue-400">
            {Math.round(confidence * 100)}%
          </div>
          <div className="text-sm text-gray-400">
            Confidence
          </div>
        </div>

        {/* Backtest Result */}
        <div className="text-center mb-4">
          <div className="text-lg font-medium">
            {getBacktestDisplay()}
          </div>
          <div className="text-sm text-gray-400">
            Backtest Result
          </div>
        </div>

        {/* Trend */}
        <div className="text-center">
          <div className={`text-2xl font-semibold flex items-center justify-center gap-2 ${getTrendColor()}`}>
            <span>{trend.toUpperCase()}</span>
            <span>{getTrendIcon()}</span>
          </div>
          <div className="text-sm text-gray-400">
            15-Day Trend
          </div>
        </div>

        {/* Action Indicator */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getSignalBg()}`}>
              <div className={`w-2 h-2 rounded-full ${getSignalColor().replace('text', 'bg')}`}></div>
              <span className={`text-sm font-medium ${getSignalColor()}`}>
                {signal.toUpperCase() === 'BUY' && 'Consider Buying'}
                {signal.toUpperCase() === 'SELL' && 'Consider Selling'}
                {signal.toUpperCase() === 'WATCH' && 'Hold Position'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionSummaryCard;
