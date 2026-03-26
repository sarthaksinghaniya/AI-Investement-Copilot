import React, { useEffect, useState } from 'react'
import './index.css'

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
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-250">
      <div className="container-wide py-8">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">AI Investment Copilot</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Professional fintech UI</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Overview</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Use the dashboard to search symbols and explore signals.</p>
            </div>
          </div>

          <aside>
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md bg-indigo-600 text-white">Open Dashboard</button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700">View Alerts</button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
