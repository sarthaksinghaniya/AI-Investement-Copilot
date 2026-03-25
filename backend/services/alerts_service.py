import datetime
import asyncio
from backend.services.stock_service import fetch_stock_data
import logging

logger = logging.getLogger(__name__)

STOCK_UNIVERSE = ["TCS.NS", "INFY.NS", "RELIANCE.NS", "HDFCBANK.NS"]

# store latest alert signal per stock to avoid duplicates with timestamp
_last_alerts: dict[str, dict] = {}
ALERT_TTL = datetime.timedelta(hours=1)
ALERT_LOCK = asyncio.Lock()


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


async def _process_stock(symbol: str) -> dict | None:
    """Process a single stock for alert generation."""
    try:
        data = await fetch_stock_data(symbol)
        signal = data.get('signal')
        confidence = int(data.get('confidence', 0))

        if not _is_eligible_alert(signal, confidence):
            return None

        now = datetime.datetime.utcnow()
        async with ALERT_LOCK:
            last_entry = _last_alerts.get(symbol)
            if last_entry and last_entry.get('signal') == signal:
                elapsed = now - last_entry.get('timestamp', now)
                if elapsed < ALERT_TTL:
                    return None

            _last_alerts[symbol] = {'signal': signal, 'timestamp': now}

        return _build_alert(symbol, signal, confidence)

    except Exception as exc:
        logger.warning('Skipping alert for %s: %s', symbol, exc)
        return None


async def generate_alerts() -> list[dict]:
    """Generate proactive alerts from pre-defined stock universe."""
    tasks = [_process_stock(symbol) for symbol in STOCK_UNIVERSE]
    results = await asyncio.gather(*tasks)
    return [item for item in results if item is not None]
