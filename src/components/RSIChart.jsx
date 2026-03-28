import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const RSIChart = ({ historicalData, indicators }) => {
  const safeNumber = (value) => {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  };

  const historicalSeries = Array.isArray(historicalData)
    ? historicalData
        .map((item, index) => ({
          date: item.date || `Day ${index + 1}`,
          rsi: safeNumber(item.rsi ?? item.RSI),
        }))
        .filter((item) => item.rsi !== null)
    : [];

  const indicatorSeries = Array.isArray(indicators?.RSI)
    ? indicators.RSI
        .map((rsi, index) => ({
          date: `Day ${index + 1}`,
          rsi: safeNumber(rsi),
        }))
        .filter((item) => item.rsi !== null)
    : [];

  const fallbackRsi = safeNumber(indicators?.rsi ?? indicators?.RSI);

  const chartData = historicalSeries.length > 0
    ? historicalSeries
    : indicatorSeries.length > 0
      ? indicatorSeries
      : fallbackRsi !== null
        ? [{ date: 'Latest', rsi: fallbackRsi }]
        : [];

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">RSI Chart</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          No RSI data available
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-sm text-purple-400">
            RSI: {payload[0].value ? payload[0].value.toFixed(2) : 'N/A'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">RSI (Relative Strength Index)</h3>
      <ResponsiveContainer width="100%" height={250}>
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
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Overbought line at 70 */}
          <ReferenceLine 
            y={70} 
            stroke="#EF4444" 
            strokeDasharray="5 5" 
            strokeWidth={1.5}
            label={{ value: "Overbought (70)", position: "right", fill: "#EF4444", fontSize: 11 }}
          />
          
          {/* Oversold line at 30 */}
          <ReferenceLine 
            y={30} 
            stroke="#10B981" 
            strokeDasharray="5 5" 
            strokeWidth={1.5}
            label={{ value: "Oversold (30)", position: "right", fill: "#10B981", fontSize: 11 }}
          />
          
          {/* Middle line at 50 */}
          <ReferenceLine 
            y={50} 
            stroke="#6B7280" 
            strokeDasharray="3 3" 
            strokeWidth={1}
            opacity={0.5}
          />
          
          <Line
            type="monotone"
            dataKey="rsi"
            stroke="#A855F7"
            strokeWidth={2}
            dot={false}
            name="RSI"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Overbought (&gt;70)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span>Neutral (30-70)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Oversold (&lt;30)</span>
        </div>
      </div>
    </div>
  );
};

export default RSIChart;
