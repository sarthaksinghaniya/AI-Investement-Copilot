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

const PriceChart = ({ historicalData, indicators, futurePredictions }) => {
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Price Forecast (Next 15 Steps)</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No price data available
        </div>
      </div>
    );
  }

  const safeNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  };

  const chartData = historicalData.map((item, index) => ({
    date: item.date || `Day ${index + 1}`,
    close: safeNumber(item.close) ?? 0,
    ema10: safeNumber(item.ema_10 ?? item.EMA_10),
    ema20: safeNumber(item.ema_20 ?? item.EMA_20),
    sma20: safeNumber(item.sma_20 ?? item.SMA_20),
    sma50: safeNumber(item.sma_50 ?? item.SMA_50),
  }));

  // Add future predictions to chart data
  const futureData = futurePredictions && futurePredictions.length > 0 ? futurePredictions.map((pred, i) => ({
    date: `F${i + 1}`,
    predicted: pred,
    close: null, // No actual price for future dates
    ema10: null,
    ema20: null,
    sma20: null,
    sma50: null,
  })) : [];

  const mergedChartData = [...chartData, ...futureData];

  const fallbackEma10 = safeNumber(indicators?.ema_10 ?? indicators?.EMA_10);
  const fallbackEma20 = safeNumber(indicators?.ema_20 ?? indicators?.EMA_20);
  const fallbackSma20 = safeNumber(indicators?.sma_20 ?? indicators?.SMA_20);
  const fallbackSma50 = safeNumber(indicators?.sma_50 ?? indicators?.SMA_50);

  const normalizedChartData = mergedChartData.map((item) => ({
    ...item,
    ema10: item.ema10 ?? fallbackEma10,
    ema20: item.ema20 ?? fallbackEma20,
    sma20: item.sma20 ?? fallbackSma20,
    sma50: item.sma50 ?? fallbackSma50,
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
      <h3 className="text-lg font-semibold text-white mb-4">Price Forecast (Next 15 Steps)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={normalizedChartData}>
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
            name="Actual Price"
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
            dataKey="sma20"
            stroke="#F59E0B"
            strokeWidth={1.5}
            dot={false}
            name="SMA 20"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#ff7300"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            name="Future Prediction"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
