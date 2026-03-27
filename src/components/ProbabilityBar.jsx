import React from 'react';

const ProbabilityBar = ({ probabilities }) => {
  if (!probabilities) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Signal Probabilities</h3>
        <div className="flex items-center justify-center h-32 text-gray-400">
          No probability data available
        </div>
      </div>
    );
  }

  const buyProbability = probabilities.BUY || 0;
  const sellProbability = probabilities.SELL || 0;
  const watchProbability = probabilities.WATCH || 0;

  const getBarColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-500';
      case 'SELL':
        return 'bg-red-500';
      case 'WATCH':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTextColor = (signal) => {
    switch (signal) {
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

  const ProbabilityBarRow = ({ label, probability, signal }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`font-medium ${getTextColor(signal)}`}>
          {signal}
        </span>
        <span className="text-white font-semibold">
          {(probability * 100).toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getBarColor(signal)} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${probability * 100}%` }}
        />
      </div>
    </div>
  );

  const maxProbability = Math.max(buyProbability, sellProbability, watchProbability);
  const dominantSignal = maxProbability === buyProbability ? 'BUY' : 
                        maxProbability === sellProbability ? 'SELL' : 'WATCH';

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Signal Probabilities</h3>
        {maxProbability > 0.5 && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBarColor(dominantSignal)} text-white`}>
            Strong {dominantSignal}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <ProbabilityBarRow
          label="Buy Signal"
          probability={buyProbability}
          signal="BUY"
        />
        <ProbabilityBarRow
          label="Sell Signal"
          probability={sellProbability}
          signal="SELL"
        />
        <ProbabilityBarRow
          label="Watch Signal"
          probability={watchProbability}
          signal="WATCH"
        />
      </div>

      {(buyProbability + sellProbability + watchProbability) > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Confidence Level</span>
            <span className={`font-medium ${maxProbability > 0.7 ? 'text-green-400' : maxProbability > 0.5 ? 'text-yellow-400' : 'text-gray-400'}`}>
              {maxProbability > 0.7 ? 'High' : maxProbability > 0.5 ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProbabilityBar;
