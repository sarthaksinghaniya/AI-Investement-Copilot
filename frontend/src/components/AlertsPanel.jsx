import React, { useEffect, useState } from 'react'
import { getAlerts } from '../services/api'

function SignalBadge({ signal }) {
  const cls = signal === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${cls}`}>{signal}</span>
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAlerts()
      if (Array.isArray(res)) {
        // normalize confidence and filter strong BUY/SELL
        const items = res
          .map((a) => ({ ...a, confidence: Number(a.confidence) }))
          .filter((a) => (a.signal === 'BUY' || a.signal === 'SELL'))
          .filter((a) => {
            const c = Number(a.confidence || 0)
            const normalized = c > 1 ? c / 100 : c
            return normalized >= 0.7
          })
        setAlerts(items)
      } else {
        setAlerts([])
      }
    } catch (err) {
      setError(err?.detail || err?.message || String(err))
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const formatConfidence = (c) => {
    const n = Number(c)
    if (isNaN(n)) return String(c)
    const pct = n > 1 ? n : Math.round(n * 100)
    return `${pct}%`
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Alerts</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      {!loading && alerts.length === 0 && !error && (
        <div className="text-sm text-gray-500">No strong BUY/SELL alerts at this time.</div>
      )}

      <ul className="space-y-3">
        {alerts.map((a, i) => (
          <li key={i} className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="flex items-center gap-3">
              <div className="w-20">
                <div className="text-sm text-gray-500">Symbol</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{a.symbol}</div>
              </div>

              <div>
                <SignalBadge signal={a.signal} />
                <div className="text-xs text-gray-500 mt-1">{a.message}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold">{formatConfidence(a.confidence)}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(a.timestamp).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
