import React from 'react'
import './index.css'

export default function App() {
  return (
    <div className="app-center">
      <div className="w-full max-w-3xl px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10">
          <h1 className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
            Welcome
          </h1>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
            React + Vite + Tailwind setup
          </p>
        </div>
      </div>
    </div>
  )
}
