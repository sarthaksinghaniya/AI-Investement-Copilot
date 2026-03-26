import React, { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import StockCard from '../components/StockCard'
import PriceChart from '../components/PriceChart'
import RSIChart from '../components/RSIChart'
import ProbabilityBar from '../components/ProbabilityBar'
import CopilotChat from '../components/CopilotChat'
import AlertsPanel from '../components/AlertsPanel'
import { getStock } from '../services/api'

export default function Dashboard({ selectedStock, setSelectedStock }) {
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // fetch stock data when selectedStock (symbol) changes
  useEffect(() => {
    let active = true
    const symbol = selectedStock
    if (!symbol) {
      setStock(null)
      setError(null)
      setLoading(false)
      return
    }

    const fetch = async () => {
      setLoading(true)
      setError(null)
      setStock(null)
      try {
        const res = await getStock(typeof symbol === 'string' ? symbol : symbol.symbol ?? symbol)
        if (!active) return
        setStock(res)
      } catch (err) {
        if (!active) return
        setError(err?.detail || err?.message || String(err))
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    fetch()

    return () => {
      active = false
    }
  }, [selectedStock])

  const handleSearch = (symbol) => {
    if (typeof setSelectedStock === 'function') setSelectedStock(symbol)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {loading && <div className="p-4 bg-yellow-50 text-yellow-800 rounded">Loading {selected}...</div>}
          {error && <div className="p-4 bg-red-50 text-red-800 rounded">Error: {error}</div>}

          {stock && (
            <div className="space-y-4">
              <StockCard
                symbol={stock.symbol}
                price={stock.latest_price}
                signal={stock.signal?.type ?? stock.signal?.signal ?? null}
                confidence={typeof stock.signal?.confidence === 'number' ? stock.signal.confidence : stock.signal?.confidence}
                reason={stock.signal?.reason}
                topFactors={stock.signal?.top_factors ?? stock.signal?.topFactors}
              />

              <PriceChart stock={stock} />

              <RSIChart stock={stock} />
            </div>
          )}

          {!stock && !loading && (
            <div className="p-6 bg-white rounded shadow">Search for a stock to see details and charts.</div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="space-y-4">
            <AlertsPanel />
            {stock && <ProbabilityBar signal={stock.signal} />}
          </div>

          <div className="h-[420px] mt-4">
            <div className="card h-full p-0 overflow-hidden">
              <CopilotChat selectedStock={stock} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
