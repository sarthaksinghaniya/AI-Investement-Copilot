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
      <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">RSI Chart</h3>
        <div className="flex h-64 items-center justify-center text-gray-500">
          No RSI data available
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-white p-3 shadow-md">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            RSI: {payload[0].value ? payload[0].value.toFixed(2) : 'N/A'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">RSI (Relative Strength Index)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="4 6" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
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
            stroke="#2563EB"
            strokeWidth={2}
            dot={false}
            name="RSI"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
          <span>Overbought (&gt;70)</span>
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-3 w-3 rounded-full bg-gray-400"></div>
          <span>Neutral (30-70)</span>
        </div>
        <div className="flex items-center">
          <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
          <span>Oversold (&lt;30)</span>
        </div>
      </div>
    </div>
  );
};

export default RSIChart;
