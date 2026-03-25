import React, { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [symbol, setSymbol] = useState('')

  const submit = (e) => {
    if (e) e.preventDefault()
    const trimmed = symbol.trim()
    if (!trimmed) return
    if (typeof onSearch === 'function') onSearch(trimmed)
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Ticker symbol (e.g. AAPL)"
        aria-label="Search symbol"
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
      >
        Search
      </button>
    </form>
  )
}
