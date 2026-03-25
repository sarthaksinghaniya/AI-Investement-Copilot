import re
from backend.services.stock_service import fetch_stock_data
import logging

logger = logging.getLogger(__name__)

_STOCK_MAP = {
    'TCS': 'TCS.NS',
    'INFOSYS': 'INFY.NS',
    'INFY': 'INFY.NS',
    'RELIANCE': 'RELIANCE.NS',
    'ICICI': 'ICICI.NS',
    'HDFC': 'HDFC.NS',
}


def detect_symbol_from_query(query: str) -> str | None:
    """Detect stock symbol from a query string using simple rule-based matching."""
    if not query or not isinstance(query, str):
        return None

    normalized = re.sub(r'[^A-Za-z0-9 ]+', ' ', query).upper()
    tokens = normalized.split()

    for token in tokens:
        if token in _STOCK_MAP:
            return _STOCK_MAP[token]

    return None


async def generate_copilot_reply(query: str) -> dict:
    """Generate AI copilot structured and conversational answer for stock queries."""
    symbol = detect_symbol_from_query(query)
    if not symbol:
        return {
            'answer': 'Please specify a stock, e.g., "TCS" or "Infosys".',
            'details': None,
        }

    try:
        stock_data = await fetch_stock_data(symbol)
    except ValueError as exc:
        logger.warning('Stock service error for %s: %s', symbol, exc)
        return {
            'answer': str(exc),
            'details': None,
        }
    except Exception as exc:
        logger.error('Unexpected error in copilot service: %s', exc)
        return {
            'answer': 'An error occurred while processing your request.',
            'details': None,
        }

    # Extract ML signal and indicators
    signal_data = stock_data.get('signal', {})
    indicators = stock_data.get('indicators', {})
    signal = signal_data.get('type', 'WATCH')
    confidence = signal_data.get('confidence', 0.0)
    probabilities = signal_data.get('probabilities', {})
    source = signal_data.get('source', 'ml_model')

    # Feature importance (static order for now)
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

    # Reasoning layer
    rsi = indicators.get('rsi') or indicators.get('RSI')
    ema_10 = indicators.get('ema_10') or indicators.get('EMA_10')
    ema_20 = indicators.get('ema_20') or indicators.get('EMA_20')
    sma_50 = indicators.get('sma_50') or indicators.get('SMA_50')
    momentum = indicators.get('momentum')
    volatility = indicators.get('volatility')

    reasoning = []
    if signal == 'BUY':
        if rsi is not None and rsi < 35:
            reasoning.append('RSI indicates potential reversal or strength')
        if ema_10 and ema_20 and ema_10 > ema_20:
            reasoning.append('Short-term EMA above long-term EMA (bullish)')
        if sma_50 and ema_20 and sma_50 > ema_20:
            reasoning.append('SMA_50 above EMA_20 (uptrend)')
        if momentum and momentum > 0:
            reasoning.append('Positive momentum detected')
        if volatility and volatility < 0.03:
            reasoning.append('Low volatility, stable uptrend')
    elif signal == 'SELL':
        if rsi is not None and rsi > 65:
            reasoning.append('RSI indicates overbought/weakness')
        if ema_10 and ema_20 and ema_10 < ema_20:
            reasoning.append('Short-term EMA below long-term EMA (bearish)')
        if sma_50 and ema_20 and sma_50 < ema_20:
            reasoning.append('SMA_50 below EMA_20 (downtrend)')
        if momentum and momentum < 0:
            reasoning.append('Negative momentum detected')
        if volatility and volatility > 0.04:
            reasoning.append('High volatility, unstable trend')
    else:
        reasoning.append('No strong trend or signal detected')

    # Compose human-like response
    if signal == 'BUY':
        response = (
            f"Based on current market indicators, {symbol} shows a bullish signal.\n"
            f"- Confidence: {confidence:.2f}\n"
            f"- Top indicators: {top_feat_str}\n"
            + ''.join([f"- {r}\n" for r in reasoning]) +
            "Recommendation: Consider buying, but monitor price action."
        )
    elif signal == 'SELL':
        response = (
            f"{symbol} is showing bearish signals.\n"
            f"- Confidence: {confidence:.2f}\n"
            f"- Top indicators: {top_feat_str}\n"
            + ''.join([f"- {r}\n" for r in reasoning]) +
            "Recommendation: Consider selling or avoiding entry."
        )
    else:
        response = (
            f"{symbol} is currently in a neutral zone.\n"
            f"- Confidence: {confidence:.2f}\n"
            f"- Top indicators: {top_feat_str}\n"
            + ''.join([f"- {r}\n" for r in reasoning]) +
            "Recommendation: Wait for a clearer opportunity."
        )

    return {
        "symbol": symbol,
        "signal": signal,
        "confidence": confidence,
        "response": response.strip(),
    }
