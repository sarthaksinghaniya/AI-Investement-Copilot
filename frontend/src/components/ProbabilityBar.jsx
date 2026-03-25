import React from 'react'

function Bar({ value = 0, color = 'bg-gray-300' }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)))
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded h-3 overflow-hidden">
      <div
        className={`${color} h-full`} 
        style={{ width: `${pct}%`, transition: 'width 300ms ease' }}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

export default function ProbabilityBar({ signal = {} }) {
  // Expect signal.probabilities = { buy: 0.6, sell: 0.2, watch: 0.2 }
  const probs = signal.probabilities || signal.probability || {}
  const buy = Number(probs.buy ?? probs.BUY ?? probs["buy"] ?? 0)
  const sell = Number(probs.sell ?? probs.SELL ?? probs["sell"] ?? 0)
  const watch = Number(probs.watch ?? probs.WATCH ?? probs["watch"] ?? 0)

  const items = [
    { key: 'BUY', value: buy, color: 'bg-green-500' },
    { key: 'SELL', value: sell, color: 'bg-red-500' },
    { key: 'WATCH', value: watch, color: 'bg-yellow-400' },
  ]

  return (
    <div className="w-full space-y-3">
      {items.map(({ key, value, color }) => (
        <div key={key} className="flex items-center gap-3">
          <div className="w-16 text-sm font-medium text-gray-700 dark:text-gray-200">{key}</div>
          <div className="flex-1">
            <Bar value={isNaN(value) ? 0 : value} color={color} />
          </div>
          <div className="w-16 text-right text-sm text-gray-600 dark:text-gray-300">
            {(isNaN(value) ? 0 : Math.round(value * 100))}%
          </div>
        </div>
      ))}
    </div>
  )
}
