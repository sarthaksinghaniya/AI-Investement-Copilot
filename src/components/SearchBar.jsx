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
            className="w-full px-5 py-3 pl-12 pr-32 rounded-2xl border border-gray-200 shadow-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:scale-[1.01] transition-all duration-300 ease-out"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1.5 cursor-pointer px-6 py-3 rounded-2xl bg-gray-900 text-white transition-all duration-300 hover:bg-black hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
