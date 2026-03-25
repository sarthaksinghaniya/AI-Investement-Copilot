import datetime
from services.stock_service import fetch_stock_data
import logging

logger = logging.getLogger(__name__)

STOCK_UNIVERSE = ["TCS.NS", "INFY.NS", "RELIANCE.NS", "HDFCBANK.NS"]

# store latest alert signal per stock to avoid duplicates
_last_alerts: dict[str, str] = {}


def _build_alert(symbol: str, signal: str, confidence: int) -> dict:
    """Build alert payload with human-friendly message and timestamp."""
    if signal == 'BUY':
        message = 'Strong BUY signal detected'
    elif signal == 'SELL':
        message = 'Bearish trend with high confidence'
    else:
        message = 'No actionable alert'

    return {
        'symbol': symbol,
        'signal': signal,
        'confidence': confidence,
        'message': message,
        'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
    }


def _is_eligible_alert(signal: str, confidence: int) -> bool:
    return (signal == 'BUY' and confidence >= 70) or (signal == 'SELL' and confidence >= 70)


async def generate_alerts() -> list[dict]:
    """Generate proactive alerts from pre-defined stock universe."""
    alerts = []

    for symbol in STOCK_UNIVERSE:
        try:
            data = await fetch_stock_data(symbol)
            signal = data.get('signal')
            confidence = int(data.get('confidence', 0))

            if not _is_eligible_alert(signal, confidence):
                continue

            last_signal = _last_alerts.get(symbol)
            if last_signal == signal:
                # duplicate; skip
                continue

            alert = _build_alert(symbol, signal, confidence)
            alerts.append(alert)
            _last_alerts[symbol] = signal

        except Exception as exc:
            logger.warning('Skipping alert for %s: %s', symbol, exc)
            continue

    return alerts
