import React from 'react';

const ProbabilityBar = ({ probabilities }) => {
  if (!probabilities) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
        <h3 className="mb-4 text-lg font-medium text-gray-800">Signals</h3>
        <div className="flex h-32 items-center justify-center text-gray-500">
          No probability data available
        </div>
      </div>
    );
  }

  const buyProbability = Number(probabilities.BUY ?? probabilities.buy ?? 0);
  const sellProbability = Number(probabilities.SELL ?? probabilities.sell ?? 0);
  const watchProbability = Number(probabilities.WATCH ?? probabilities.watch ?? 0);

  const getBarColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'bg-green-600';
      case 'SELL':
        return 'bg-red-500';
      case 'WATCH':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getTextColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-600';
      case 'SELL':
        return 'text-red-500';
      case 'WATCH':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const ProbabilityBarRow = ({ label, probability, signal }) => (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`font-medium ${getTextColor(signal)}`}>
          {signal}
        </span>
        <span className="font-semibold text-gray-900">
          {(probability * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${getBarColor(signal)} transition-all duration-500 ease-out`}
          style={{ width: `${probability * 100}%` }}
        />
      </div>
    </div>
  );

  const maxProbability = Math.max(buyProbability, sellProbability, watchProbability);
  const dominantSignal = maxProbability === buyProbability ? 'BUY' : 
                        maxProbability === sellProbability ? 'SELL' : 'WATCH';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-800">Signals</h3>
        {maxProbability > 0.5 && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${getBarColor(dominantSignal)}`}>
            Strong {dominantSignal}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
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
        <div className="mt-6 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Confidence Level</span>
            <span className={`font-medium ${maxProbability > 0.7 ? 'text-green-600' : maxProbability > 0.5 ? 'text-blue-600' : 'text-gray-400'}`}>
              {maxProbability > 0.7 ? 'High' : maxProbability > 0.5 ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProbabilityBar;
