import re
from services.stock_service import fetch_stock_data
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

    signal = stock_data.get('signal')
    confidence = stock_data.get('confidence')
    reasoning = stock_data.get('reasoning', [])

    base_answer = f"{symbol.split('.')[0]} shows a {signal} signal with {confidence}% confidence."

    if signal == 'BUY':
        tone = 'looks promising right now. The stock is in an oversold zone and showing signs of recovery.'
    elif signal == 'SELL':
        tone = 'may be weakening. The stock is overbought and appears to be entering a downtrend.'
    else:
        tone = 'is worth watching closely. The market conditions are mixed, so stay cautious.'

    conversational = (
        f"{symbol.split('.')[0]} {tone} "
        "However, consider market risks before investing."
    )

    return {
        'answer': f"{base_answer} {conversational}",
        'details': {
            'signal': signal,
            'confidence': confidence,
            'reasoning': reasoning,
        },
    }
