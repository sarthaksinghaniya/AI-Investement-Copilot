import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PriceChart = ({ historicalData, indicators }) => {
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Price Chart</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No price data available
        </div>
      </div>
    );
  }

  const chartData = historicalData.map((item, index) => ({
    date: item.date || `Day ${index + 1}`,
    close: item.close || 0,
    ema10: indicators?.EMA_10?.[index] || null,
    ema20: indicators?.EMA_20?.[index] || null,
    sma50: indicators?.SMA_50?.[index] || null,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value ? entry.value.toFixed(2) : 'N/A'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Price Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#9CA3AF' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#FFFFFF"
            strokeWidth={2}
            dot={false}
            name="Close Price"
          />
          <Line
            type="monotone"
            dataKey="ema10"
            stroke="#3B82F6"
            strokeWidth={1.5}
            dot={false}
            name="EMA 10"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ema20"
            stroke="#10B981"
            strokeWidth={1.5}
            dot={false}
            name="EMA 20"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="sma50"
            stroke="#F59E0B"
            strokeWidth={1.5}
            dot={false}
            name="SMA 50"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
