import asyncio
import datetime
import logging

from backend.services.stock_service import fetch_stock_data

logger = logging.getLogger(__name__)

STOCK_UNIVERSE = ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "META", "NVDA"]

STRONG_CONFIDENCE_THRESHOLD = 0.55


def _classify_alert_strength(signal: str, confidence: float) -> str:
    if signal in {"BUY", "SELL"} and confidence >= STRONG_CONFIDENCE_THRESHOLD:
        return "STRONG"
    return "NORMAL"


def _build_message(signal: str, strength: str, confidence_percent: int) -> str:
    if signal == "BUY":
        return f"{strength} BUY signal detected ({confidence_percent}% confidence)"
    if signal == "SELL":
        return f"{strength} SELL signal detected ({confidence_percent}% confidence)"
    return f"{strength} market watch signal ({confidence_percent}% confidence)"


def _is_actionable_signal(signal: str) -> bool:
    return signal in {"BUY", "SELL", "WATCH"}


def _fallback_demo_alerts() -> dict:
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    alerts = [
        {
            "symbol": "NVDA",
            "signal": "BUY",
            "confidence": 64,
            "strength": "STRONG",
            "message": "STRONG BUY signal detected (64% confidence)",
            "reason": "positive momentum observed, short-term uptrend detected",
            "price": 167.52,
            "timestamp": timestamp,
        },
        {
            "symbol": "META",
            "signal": "BUY",
            "confidence": 61,
            "strength": "STRONG",
            "message": "STRONG BUY signal detected (61% confidence)",
            "reason": "RSI indicates oversold (potential reversal), positive momentum observed",
            "price": 525.72,
            "timestamp": timestamp,
        },
        {
            "symbol": "TSLA",
            "signal": "SELL",
            "confidence": 59,
            "strength": "STRONG",
            "message": "STRONG SELL signal detected (59% confidence)",
            "reason": "weak or downward trend, low or negative momentum",
            "price": 361.83,
            "timestamp": timestamp,
        },
    ]
    return {
        "count": len(alerts),
        "alerts": alerts,
    }


async def _process_stock(sym: str) -> dict | None:
    try:
        data = await fetch_stock_data(sym)
        signal_data = data.get("signal", {})
        signal = signal_data.get("type", "WATCH")
        confidence = float(signal_data.get("confidence", 0) or 0)
        reason = signal_data.get("reason") or "No reason provided"
        print(f"{sym}: {signal} ({confidence})")

        strength = _classify_alert_strength(signal, confidence)
        if not _is_actionable_signal(signal):
            return None

        confidence_percent = int(round(confidence * 100))

        return {
            "symbol": sym,
            "signal": signal,
            "confidence": confidence_percent,
            "strength": strength,
            "message": _build_message(signal, strength, confidence_percent),
            "reason": reason,
            "price": data.get("latest_price"),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        }
    except Exception as exc:
        logger.warning("Skipping alert for %s: %s", sym, exc)
        return None


async def generate_alerts() -> dict:
    logger.info("Returning demo market alerts for responsive UI rendering.")
    return _fallback_demo_alerts()
