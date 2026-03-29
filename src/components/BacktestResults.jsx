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
    <div className="rounded-2xl bg-gray-50 p-6 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      <h3 className="mb-6 text-lg font-medium text-gray-800">Portfolio Simulation</h3>
      
      {/* Profit Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Total Profit</p>
          <p className={`text-3xl font-semibold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
            {isProfit ? '+' : ''}₹{profit.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Return %</p>
          <p className={`text-3xl font-semibold ${isProfit ? 'text-green-600' : 'text-red-500'}`}>
            {isProfit ? '+' : ''}{return_pct}%
          </p>
        </div>
        
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Win Rate</p>
          <p className="text-3xl font-semibold text-blue-600">
            {win_rate}%
          </p>
        </div>
      </div>

      {/* Trading Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Final Portfolio Value</p>
          <p className="text-xl font-semibold text-gray-900">
            ₹{final_value.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-xl bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Total Trades</p>
          <p className="text-xl font-semibold text-gray-900">
            {total_trades}
          </p>
        </div>
      </div>

      {/* Recent Trades */}
      {trades && trades.length > 0 && (
        <div>
          <h4 className="mb-3 text-lg font-medium text-gray-800">Recent Trades</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {trades.slice(-5).map((trade, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between rounded-xl p-3 ${
                  trade.type === 'BUY' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    trade.type === 'BUY' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {trade.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    Step {trade.step}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    ₹{trade.price.toLocaleString()}
                  </p>
                  {trade.profit_pct !== undefined && (
                    <p className={`text-xs ${
                      trade.profit_pct > 0 ? 'text-green-600' : 'text-red-500'
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
