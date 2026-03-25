import React from 'react'

function signalStyles(signal) {
  switch ((signal || '').toUpperCase()) {
    case 'BUY':
      return { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' }
    case 'SELL':
      return { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' }
    case 'WATCH':
    default:
      return { bg: 'bg-yellow-50', text: 'text-yellow-800', ring: 'ring-yellow-200' }
  }
}

export default function StockCard({ symbol, price, signal, confidence, reason, topFactors = [] }) {
  const s = signalStyles(signal)
  const confPct = typeof confidence === 'number' ? `${(confidence * 100).toFixed(1)}%` : confidence

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-300">Symbol</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">{symbol}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-300">Price</div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{price}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${s.bg} ${s.text} ring-1 ${s.ring}`}>
          {signal || 'WATCH'}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300">Confidence: <span className="font-medium">{confPct}</span></div>
      </div>

      {reason ? (
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-300">Reason</div>
          <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">{reason}</div>
        </div>
      ) : null}

      {topFactors && topFactors.length > 0 ? (
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-300">Top Factors</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {topFactors.map((f, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                {f}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
