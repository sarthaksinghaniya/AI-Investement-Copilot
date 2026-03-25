import React, { useMemo, useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

// PriceChart expects data at either `stock.historical_data` or directly passed as `data` prop.
// Plots: `close`, `EMA_10`, `EMA_20`, `SMA_50`.
export default function PriceChart({ stock, data: dataProp }) {
  const raw = dataProp ?? stock?.historical_data ?? []

  // Normalise data: ensure x-axis key `date` exists; fallback to index.
  const data = useMemo(() => {
    return raw.map((d, i) => ({
      date: d.date ?? d.time ?? d.timestamp ?? i,
      close: d.close ?? d.Close ?? d.price ?? null,
      EMA_10: d.EMA_10 ?? d.ema10 ?? d.ema_10 ?? null,
      EMA_20: d.EMA_20 ?? d.ema20 ?? d.ema_20 ?? null,
      SMA_50: d.SMA_50 ?? d.sma50 ?? d.sma_50 ?? null,
    }))
  }, [raw])

  // detect dark mode for tooltip styling
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    const check = () => setIsDark(mq ? mq.matches : false)
    check()
    if (mq) mq.addEventListener('change', check)
    return () => mq && mq.removeEventListener('change', check)
  }, [])

  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    color: isDark ? '#f3f4f6' : '#111827',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  }

  const stroke = {
    close: '#3b82f6', // blue
    EMA_10: '#8b5cf6', // purple
    EMA_20: '#06b6d4', // teal
    SMA_50: '#f59e0b', // amber
  }

  const formatYAxis = (v) => (v == null ? '-' : v)

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke={isDark ? '#1f2937' : '#f3f4f6'} />
          <XAxis
            dataKey="date"
            tick={{ fill: isDark ? '#d1d5db' : '#6b7280' }}
            tickFormatter={(v) => (typeof v === 'number' ? v : String(v))}
          />
          <YAxis tick={{ fill: isDark ? '#d1d5db' : '#6b7280' }} domain={['auto', 'auto']} tickFormatter={formatYAxis} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: isDark ? '#9ca3af' : '#374151' }} />
          <Legend wrapperStyle={{ color: isDark ? '#e5e7eb' : '#111827' }} />

          <Line type="monotone" dataKey="close" stroke={stroke.close} strokeWidth={2} dot={false} name="Close" />
          <Line type="monotone" dataKey="EMA_10" stroke={stroke.EMA_10} strokeWidth={2} dot={false} name="EMA 10" />
          <Line type="monotone" dataKey="EMA_20" stroke={stroke.EMA_20} strokeWidth={2} dot={false} name="EMA 20" />
          <Line type="monotone" dataKey="SMA_50" stroke={stroke.SMA_50} strokeWidth={2} dot={false} name="SMA 50" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
