import React from 'react';
import { TrendingUp, TrendingDown, Eye } from 'lucide-react';

const StockCard = ({ stockData }) => {
  if (!stockData) return null;

  const { symbol, price, signal, confidence, reason, top_factors = [] } = stockData;

  const getSignalColor = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return 'bg-green-600 text-white';
      case 'SELL':
        return 'bg-red-600 text-white';
      case 'WATCH':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return <TrendingUp className="h-5 w-5" />;
      case 'SELL':
        return <TrendingDown className="h-5 w-5" />;
      case 'WATCH':
        return <Eye className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getSignalTextColor = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return 'text-green-400';
      case 'SELL':
        return 'text-red-400';
      case 'WATCH':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const confPercent = confidence ? (confidence * 100).toFixed(1) : '0';

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
          <p className="text-3xl font-semibold text-white mt-1">
            ${price ? price.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold ${getSignalColor(signal)}`}>
            {getSignalIcon(signal)}
            <span>{signal || 'UNKNOWN'}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Confidence: {confPercent}%
          </p>
        </div>
      </div>

      {reason && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-300 mb-1">Analysis</h3>
          <p className="text-gray-300 text-sm">{reason}</p>
        </div>
      )}

      {top_factors && top_factors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Top Factors</h3>
          <div className="space-y-2">
            {top_factors.slice(0, 3).map((factor, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-300">{factor}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getSignalTextColor(signal)} bg-gray-600`}>
                  {signal}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCard;
