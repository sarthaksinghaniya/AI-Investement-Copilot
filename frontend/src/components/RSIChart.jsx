import React, { useMemo, useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'

// RSIChart expects data at `stock.historical_data` or via `data` prop.
// Plots a line for `rsi` (or `RSI`) and shows reference lines at 70 and 30.
export default function RSIChart({ stock, data: dataProp }) {
  const raw = dataProp ?? stock?.historical_data ?? []

  const data = useMemo(() => {
    return raw.map((d, i) => ({
      date: d.date ?? d.time ?? d.timestamp ?? i,
      rsi: d.rsi ?? d.RSI ?? d.rsi_14 ?? null,
    }))
  }, [raw])

  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    const check = () => setIsDark(mq ? mq.matches : false)
    check()
    if (mq) mq.addEventListener('change', check)
    return () => mq && mq.removeEventListener('change', check)
  }, [])

  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    color: isDark ? '#e5e7eb' : '#0f172a',
  }

  return (
    <div className="w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={isDark ? '#111827' : '#f3f4f6'} />
          <XAxis dataKey="date" tick={{ fill: isDark ? '#d1d5db' : '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fill: isDark ? '#d1d5db' : '#6b7280' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: isDark ? '#e5e7eb' : '#111827' }} />

          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '70', position: 'right', fill: '#ef4444' }} />
          <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 4" label={{ value: '30', position: 'right', fill: '#10b981' }} />

          <Line
            type="monotone"
            dataKey="rsi"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            name="RSI"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
