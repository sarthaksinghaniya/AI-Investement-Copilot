import yfinance as yf
import pandas as pd
import datetime
import asyncio
from backend.utils.indicators import calculate_sma, calculate_ema
from backend.services.signal_engine import generate_signal
from ml.predict import predict_prices
import logging

logger = logging.getLogger(__name__)

CACHE: dict[str, dict] = {}
CACHE_TTL_SECONDS = 60
CACHE_LOCK = asyncio.Lock()


async def fetch_stock_data(symbol: str) -> dict:
    """Fetch stock quote, historical data and indicators for a symbol."""
    if not symbol or not isinstance(symbol, str):
        logger.error('Invalid symbol received: %s', symbol)
        raise ValueError('Symbol must be a non-empty string.')

    now = datetime.datetime.utcnow()
    async with CACHE_LOCK:
        cached = CACHE.get(symbol)
        if cached:
            age = (now - cached['timestamp']).total_seconds()
            if age < CACHE_TTL_SECONDS:
                logger.info('Cache hit for %s (%ss old)', symbol, int(age))
                return cached['data']
            logger.info('Cache expired for %s (%ss old)', symbol, int(age))

    # yfinance run in sync; keep CPU-bound call outside of event loop in production
    ticker = yf.Ticker(symbol)

    info = ticker.fast_info if hasattr(ticker, 'fast_info') else ticker.info
    if not info or 'regularMarketPrice' not in info or info.get('regularMarketPrice') is None:
        logger.warning('Symbol not found or no price: %s', symbol)
        raise ValueError(f'Symbol {symbol} not found or has no available market price.')

    latest_price = float(info.get('regularMarketPrice'))

    hist = ticker.history(period='45d', interval='1d', auto_adjust=False)

    if hist.empty or len(hist) < 20:
        logger.warning('Insufficient historical data for symbol: %s', symbol)
        raise ValueError(f'Not enough historical data for symbol {symbol}.')

    hist = hist.dropna(subset=['Open', 'High', 'Low', 'Close'])

    if hist.empty:
        logger.warning('No valid OHLC rows after dropna for symbol: %s', symbol)
        raise ValueError(f'No historical OHLC data for symbol {symbol}.')

    latest_hist = hist.tail(30).copy()
    latest_hist.reset_index(inplace=True)

    latest_hist['SMA_20'] = calculate_sma(hist['Close'], window=20)
    latest_hist['EMA_20'] = calculate_ema(hist['Close'], window=20)

    historical_data_list = []
    for _, row in latest_hist.iterrows():
        historical_data_list.append({
            'date': row['Date'].strftime('%Y-%m-%d') if not pd.isna(row['Date']) else None,
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close']),
            'volume': int(row['Volume']),
            'SMA_20': None if pd.isna(row['SMA_20']) else float(row['SMA_20']),
            'EMA_20': None if pd.isna(row['EMA_20']) else float(row['EMA_20']),
        })

    indicators = {
        'SMA_20': None if pd.isna(latest_hist['SMA_20'].iloc[-1]) else float(latest_hist['SMA_20'].iloc[-1]),
        'EMA_20': None if pd.isna(latest_hist['EMA_20'].iloc[-1]) else float(latest_hist['EMA_20'].iloc[-1]),
    }

    signal_data = generate_signal(latest_hist)
    prediction_data = {}

    try:
        prediction_data = predict_prices(symbol)
    except Exception as exc:
        logger.warning('Prediction unavailable for %s: %s', symbol, exc)
        prediction_data = {'predictions': [], 'trend': 'SIDEWAYS', 'confidence': 0.0}

    response = {
        'symbol': symbol,
        'latest_price': latest_price,
        'historical_data': historical_data_list,
        'indicators': indicators,
        'signal': {
            'type': signal_data.get('signal'),
            'confidence': float(signal_data.get('confidence', 0.0)),
            'reason': signal_data.get('reason', 'based on ML model + indicators') if signal_data.get('reason') else 'based on ML model + indicators',
        },
        'prediction': {
            'next_7_days': prediction_data.get('predictions', []),
            'trend': prediction_data.get('trend', 'SIDEWAYS'),
            'confidence': prediction_data.get('confidence', 0.0),
        },
    }

    async with CACHE_LOCK:
        CACHE[symbol] = {
            'data': response,
            'timestamp': now,
        }

    return response
