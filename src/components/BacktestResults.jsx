import React from 'react';

const BacktestResults = ({ backtest }) => {
  if (!backtest || Object.keys(backtest).length === 0) {
    return null;
  }

  const {
    final_value = 100000,
    profit = 0,
    return_pct = 0,
    total_trades = 0,
    win_rate = 0,
    trades = []
  } = backtest;

  const isProfit = profit > 0;

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Portfolio Simulation</h3>
      
      {/* Profit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Profit</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}₹{profit.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Return %</p>
          <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? '+' : ''}{return_pct}%
          </p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-blue-400">
            {win_rate}%
          </p>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Final Portfolio Value</p>
          <p className="text-xl font-semibold text-white">
            ₹{final_value.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Total Trades</p>
          <p className="text-xl font-semibold text-white">
            {total_trades}
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      {trades && trades.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Recent Trades</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trades.slice(-5).map((trade, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  trade.type === 'BUY' ? 'bg-blue-900/30' : 'bg-red-900/30'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold ${
                    trade.type === 'BUY' ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {trade.type}
                  </span>
                  <span className="text-sm text-gray-300">
                    Step {trade.step}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">
                    ₹{trade.price.toLocaleString()}
                  </p>
                  {trade.profit_pct !== undefined && (
                    <p className={`text-xs ${
                      trade.profit_pct > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.profit_pct > 0 ? '+' : ''}{trade.profit_pct.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BacktestResults;
