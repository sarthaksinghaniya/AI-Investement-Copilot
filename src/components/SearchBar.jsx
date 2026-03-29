import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch, loading }) => {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
            className="w-full rounded-2xl bg-white py-4 pl-12 pr-28 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
