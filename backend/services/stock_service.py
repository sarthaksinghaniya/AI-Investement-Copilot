import yfinance as yf
import pandas as pd
import datetime
import asyncio
from backend.utils.indicators import calculate_sma, calculate_ema
from backend.services.signal_engine import generate_signal, calculate_rsi
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
    # Check for price in multiple possible fields
    price = None
    for price_field in ['regularMarketPrice', 'lastPrice', 'previousClose']:
        if price_field in info and info.get(price_field) is not None:
            price = float(info[price_field])
            break
    
    if price is None:
        logger.warning('Symbol not found or no price: %s', symbol)
        raise ValueError(f'Symbol {symbol} not found or has no available market price.')

    hist = ticker.history(period='45d', interval='1d', auto_adjust=False)

    if hist.empty or len(hist) < 20:
        logger.warning('Insufficient historical data for symbol: %s', symbol)
        raise ValueError(f'Not enough historical data for symbol {symbol}.')

    hist = hist.dropna(subset=['Open', 'High', 'Low', 'Close'])

    if hist.empty:
        logger.warning('No valid OHLC rows after dropna for symbol: %s', symbol)
        raise ValueError(f'No historical OHLC data for symbol {symbol}.')

    enriched_hist = hist.copy()
    enriched_hist['SMA_20'] = calculate_sma(enriched_hist['Close'], window=20)
    enriched_hist['EMA_10'] = calculate_ema(enriched_hist['Close'], window=10)
    enriched_hist['EMA_20'] = calculate_ema(enriched_hist['Close'], window=20)
    enriched_hist['SMA_50'] = calculate_sma(enriched_hist['Close'], window=50)
    enriched_hist['RSI'] = calculate_rsi(enriched_hist['Close'], period=14)
    enriched_hist['returns'] = enriched_hist['Close'].pct_change()
    enriched_hist['volatility'] = enriched_hist['Close'].pct_change().rolling(window=10).std()
    enriched_hist['momentum'] = enriched_hist['Close'] - enriched_hist['Close'].shift(10)
    enriched_hist['volume_change'] = enriched_hist['Volume'].pct_change()

    latest_hist = enriched_hist.tail(30).copy()
    latest_hist.reset_index(inplace=True)

    def safe_float(value):
        return None if pd.isna(value) else float(value)

    historical_data_list = []
    for _, row in latest_hist.iterrows():
        historical_data_list.append({
            'date': row['Date'].strftime('%Y-%m-%d') if not pd.isna(row['Date']) else None,
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close']),
            'volume': int(row['Volume']),
            'rsi': safe_float(row['RSI']),
            'ema_10': safe_float(row['EMA_10']),
            'ema_20': safe_float(row['EMA_20']),
            'sma_20': safe_float(row['SMA_20']),
            'sma_50': safe_float(row['SMA_50']),
            'returns': safe_float(row['returns']),
            'volatility': safe_float(row['volatility']),
            'momentum': safe_float(row['momentum']),
            'volume_change': safe_float(row['volume_change']),
            'RSI': safe_float(row['RSI']),
            'EMA_10': safe_float(row['EMA_10']),
            'EMA_20': safe_float(row['EMA_20']),
            'SMA_20': safe_float(row['SMA_20']),
            'SMA_50': safe_float(row['SMA_50']),
        })

    # Compute all required indicators for ML model
    indicators = {
        'rsi': safe_float(latest_hist['RSI'].iloc[-1]),
        'ema_10': safe_float(latest_hist['EMA_10'].iloc[-1]),
        'ema_20': safe_float(latest_hist['EMA_20'].iloc[-1]),
        'sma_50': safe_float(latest_hist['SMA_50'].iloc[-1]),
        'returns': safe_float(latest_hist['returns'].iloc[-1]),
        'volume_change': safe_float(latest_hist['volume_change'].iloc[-1]),
        'volatility': safe_float(latest_hist['volatility'].iloc[-1]),
        'momentum': safe_float(latest_hist['momentum'].iloc[-1]),
        'SMA_20': safe_float(latest_hist['SMA_20'].iloc[-1]),
        'EMA_20': safe_float(latest_hist['EMA_20'].iloc[-1]),
        'RSI_SERIES': [value for value in (safe_float(value) for value in latest_hist['RSI'].tolist())],
        'EMA_10_SERIES': [value for value in (safe_float(value) for value in latest_hist['EMA_10'].tolist())],
        'EMA_20_SERIES': [value for value in (safe_float(value) for value in latest_hist['EMA_20'].tolist())],
        'SMA_20_SERIES': [value for value in (safe_float(value) for value in latest_hist['SMA_20'].tolist())],
        'SMA_50_SERIES': [value for value in (safe_float(value) for value in latest_hist['SMA_50'].tolist())],
    }

    signal_data = generate_signal(indicators)
    prediction_data = {}

    try:
        prediction_data = predict_prices(symbol)
    except Exception as exc:
        logger.warning('Prediction unavailable for %s: %s', symbol, exc)
        prediction_data = {'predictions': [], 'trend': 'SIDEWAYS', 'confidence': 0.0}

    response = {
        'symbol': symbol,
        'latest_price': price,
        'historical_data': historical_data_list,
        'indicators': indicators,
        'signal': signal_data,
        'prediction': {
            'next_7_days': prediction_data.get('predictions', []),
            'future_predictions': prediction_data.get('future_predictions', []),  # NEW: 15-day future predictions
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
