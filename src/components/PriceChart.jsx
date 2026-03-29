import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import BacktestResults from './BacktestResults';

const PriceChart = ({ historicalData, indicators, futurePredictions, backtest }) => {
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
        <h3 className="mb-4 text-lg font-medium text-gray-800">Price Forecast</h3>
        <div className="flex h-64 items-center justify-center text-gray-500">
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

  // Add future predictions to chart data with confidence range
  const futureData = futurePredictions && futurePredictions.length > 0 ? futurePredictions.map((pred, i) => {
    const confidenceRange = pred * 0.02; // ±2% confidence range
    return {
      date: `F${i + 1}`,
      predicted: pred,
      upperBound: pred + confidenceRange,
      lowerBound: pred - confidenceRange,
      close: null, // No actual price for future dates
      ema10: null,
      ema20: null,
      sma20: null,
      sma50: null,
    };
  }) : [];

  const mergedChartData = [...chartData, ...futureData];

  const fallbackEma10 = safeNumber(indicators?.ema_10 ?? indicators?.EMA_10);
  const fallbackEma20 = safeNumber(indicators?.ema_20 ?? indicators?.EMA_20);
  const fallbackSma20 = safeNumber(indicators?.sma_20 ?? indicators?.SMA_20);
  const fallbackSma50 = safeNumber(indicators?.sma_50 ?? indicators?.SMA_50);

  // Add trade markers from backtest
  const tradeMarkers = backtest?.trades || [];
  const chartWithTrades = mergedChartData.map((item, index) => {
    const trade = tradeMarkers.find(t => t.step === index);
    return {
      ...item,
      ema10: item.ema10 ?? fallbackEma10,
      ema20: item.ema20 ?? fallbackEma20,
      sma20: item.sma20 ?? fallbackSma20,
      sma50: item.sma50 ?? fallbackSma50,
      tradeMarker: trade ? trade.type : null
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl bg-white p-3 shadow-md">
          <p className="mb-2 text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => {
            if (entry.name === 'Future Prediction' && entry.payload.upperBound) {
              return (
                <div key={index} className="mb-1">
                  <p className="text-sm font-semibold" style={{ color: entry.color }}>
                    Predicted Price: ${entry.value ? entry.value.toFixed(2) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Range: ${entry.payload.lowerBound?.toFixed(2)} - ${entry.payload.upperBound?.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ±2% Confidence Range
                  </p>
                </div>
              );
            }
            return (
              <p key={index} className="mb-1 text-sm" style={{ color: entry.color }}>
                {entry.name}: ${entry.value ? entry.value.toFixed(2) : 'N/A'}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload && payload.tradeMarker) {
      return (
        <g>
          <circle 
            cx={cx} 
            cy={cy} 
            r={6} 
            fill={payload.tradeMarker === 'BUY' ? '#22C55E' : '#EF4444'}
            stroke="#F9FAFB"
            strokeWidth={2}
          />
          <text 
            x={cx} 
            y={cy - 10} 
            fill="#111827" 
            fontSize={10} 
            textAnchor="middle"
          >
            {payload.tradeMarker === 'BUY' ? 'B' : 'S'}
          </text>
        </g>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]">
      <h3 className="mb-6 text-lg font-medium text-gray-800">Price Forecast (Next 15 Steps)</h3>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={chartWithTrades}>
          <CartesianGrid strokeDasharray="4 6" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#6B7280' }}
            iconType="line"
          />
          
          {/* Shaded prediction zone for confidence range */}
          {futurePredictions && futurePredictions.length > 0 && (
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="#3B82F6"
              fillOpacity={0.08}
              name="Upper Confidence"
            />
          )}
          {futurePredictions && futurePredictions.length > 0 && (
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="#3B82F6"
              fillOpacity={0.15}
              name="Lower Confidence"
            />
          )}
          
          {/* Technical indicators */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#111827"
            strokeWidth={2.5}
            dot={false}
            name="Actual Price"
          />
          <Line
            type="monotone"
            dataKey="ema10"
            stroke="#3B82F6"
            strokeWidth={1.8}
            dot={false}
            name="EMA 10"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ema20"
            stroke="#34D399"
            strokeWidth={1.8}
            dot={false}
            name="EMA 20"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="sma20"
            stroke="#60A5FA"
            strokeWidth={1.8}
            dot={false}
            name="SMA 20"
            connectNulls={false}
          />
          
          {/* Future prediction line with trade markers */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#2563EB"
            strokeDasharray="5 5"
            strokeWidth={2.2}
            dot={<CustomDot />}
            name="Future Prediction"
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Backtest Results */}
      {backtest && (
        <div className="mt-6">
          <BacktestResults backtest={backtest} />
        </div>
      )}
    </div>
  );
};

export default PriceChart;
