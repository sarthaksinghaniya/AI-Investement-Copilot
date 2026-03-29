import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { alertsAPI } from '../services/api';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const normalizeAlertsResponse = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.alerts)) {
      return data.alerts;
    }

    return [];
  };

  const formatConfidence = (confidence) => {
    if (confidence === null || confidence === undefined || confidence === '') {
      return '';
    }

    const numericConfidence = Number(confidence);

    if (Number.isNaN(numericConfidence)) {
      return '';
    }

    const percentage = numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence;
    return `${Math.round(percentage)}%`;
  };

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return price;
    }

    return `$${numericPrice.toFixed(2)}`;
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsAPI.getAlerts();
      setAlerts(normalizeAlertsResponse(data));
      setError(null);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'WATCH':
        return <Eye className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSignalColor = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return 'bg-green-50';
      case 'SELL':
        return 'bg-red-50';
      case 'WATCH':
        return 'bg-gray-100';
      default:
        return 'bg-gray-50';
    }
  };

  const getSignalTextColor = (signal) => {
    switch (signal?.toUpperCase()) {
      case 'BUY':
        return 'text-green-500';
      case 'SELL':
        return 'text-red-500';
      case 'WATCH':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Market Alerts</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Market Alerts</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p className="text-sm text-gray-500">No alerts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Market Alerts</h3>
        </div>
        <span className="text-sm text-gray-500">
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      <div className="border-t border-gray-100 mb-4"></div>

      {alerts.length > 0 ? (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.map((alert, index) => (
            <div
              key={alert.symbol ? `${alert.symbol}-${index}` : index}
              className={`p-3 rounded-xl ${getSignalColor(alert.signal)} transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center space-x-2">
                  {getSignalIcon(alert.signal)}
                  <span className="font-semibold text-gray-900">
                    {alert.symbol || 'Unknown'}
                  </span>
                  <span className={`text-xs font-medium ${getSignalTextColor(alert.signal)}`}>
                    {alert.signal || 'ALERT'}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${getSignalTextColor(alert.signal)}`}>
                  {formatConfidence(alert.confidence)}
                </span>
              </div>

              {alert.reason && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {alert.reason}
                </p>
              )}

              {(alert.price !== null && alert.price !== undefined) || alert.timestamp ? (
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  {alert.price !== null && alert.price !== undefined ? (
                    <span className="text-sm text-gray-700">
                      {formatPrice(alert.price)}
                    </span>
                  ) : (
                    <span></span>
                  )}

                  {alert.timestamp && (
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No strong signals detected</p>
          <p className="text-sm mt-1">Check back later for market alerts</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
