import re
from backend.services.stock_service import fetch_stock_data
from backend.utils import normalize_stock_symbol
import logging

logger = logging.getLogger(__name__)

_STOCK_MAP = {
    'TCS': 'TCS',
    'INFOSYS': 'INFY',
    'INFY': 'INFY',
    'RELIANCE': 'RELIANCE',
    'ICICI': 'ICICI',
    'HDFC': 'HDFC',
}


def detect_symbol_from_query(query: str) -> str | None:
    """Detect stock symbol from a query string using simple rule-based matching."""
    if not query or not isinstance(query, str):
        return None

    normalized = re.sub(r'[^A-Za-z0-9 ]+', ' ', query).upper()
    tokens = normalized.split()

    for token in tokens:
        if token in _STOCK_MAP:
            return normalize_stock_symbol(_STOCK_MAP[token])

    return None


async def generate_copilot_reply(query: str, stock: str = None) -> str:
    """Generate AI copilot conversational response for stock queries."""
    # Use provided stock or detect from query
    symbol = stock or detect_symbol_from_query(query)
    
    if not symbol:
        return 'Please specify a stock symbol (e.g., "TCS", "INFY", "RELIANCE").'

    try:
        stock_data = await fetch_stock_data(symbol)
    except ValueError as exc:
        logger.warning('Stock service error for %s: %s', symbol, exc)
        return str(exc)
    except Exception as exc:
        logger.error('Unexpected error in copilot service: %s', exc)
        return 'An error occurred while processing your request.'

    # Extract ML signal and indicators
    signal_data = stock_data.get('signal', {})
    indicators = stock_data.get('indicators', {})
    signal = signal_data.get('type', 'WATCH')
    confidence = signal_data.get('confidence', 0.0)
    reason = signal_data.get('reason', '')

    # Get current price
    price = stock_data.get('latest_price', 0)

    # Feature importance
    feature_importance = [
        ('SMA_50', 0.17),
        ('EMA_20', 0.16),
        ('EMA_10', 0.14),
        ('volatility', 0.13),
        ('momentum', 0.12),
        ('RSI', 0.11),
        ('volume_change', 0.09),
        ('returns', 0.09),
    ]
    top_features = [f for f, _ in feature_importance[:3]]
    top_feat_str = ', '.join(top_features)

    # Compose human-like response
    conf_pct = int(confidence * 100)
    
    if signal == 'BUY':
        response = (
            f"📈 {symbol} is showing strong bullish signals at ${price:.2f}\n\n"
            f"Signal: BUY (Confidence: {conf_pct}%)\n\n"
            f"Key Indicators:\n{reason}\n\n"
            f"Analysis: {top_feat_str}\n\n"
            f"Recommendation: This is a good entry point. Monitor support levels and volume confirmation."
        )
    elif signal == 'SELL':
        response = (
            f"📉 {symbol} is showing bearish signals at ${price:.2f}\n\n"
            f"Signal: SELL (Confidence: {conf_pct}%)\n\n"
            f"Key Indicators:\n{reason}\n\n"
            f"Analysis: {top_feat_str}\n\n"
            f"Recommendation: Consider reducing exposure or taking profits. Monitor for trend reversal."
        )
    else:
        response = (
            f"⏸️ {symbol} is neutral at ${price:.2f}\n\n"
            f"Signal: WATCH (Confidence: {conf_pct}%)\n\n"
            f"Key Indicators:\n{reason}\n\n"
            f"Analysis: {top_feat_str}\n\n"
            f"Recommendation: Wait for clearer signals or support/resistance breaks before acting."
        )

    return response
