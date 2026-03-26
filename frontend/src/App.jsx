import React, { useEffect, useState } from 'react'
import './index.css'
import Dashboard from './pages/Dashboard'

function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className={`px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-sm ${className}`}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

export default function App() {
  const [selectedStock, setSelectedStock] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
      <div className="container-wide py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">AI Investment Copilot</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Professional fintech UI</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="">
          <div className="card">
            <Dashboard selectedStock={selectedStock} setSelectedStock={setSelectedStock} />
          </div>
        </main>
      </div>
    </div>
  )
}
