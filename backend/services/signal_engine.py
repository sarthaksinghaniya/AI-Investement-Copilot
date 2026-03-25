feature_importance_order = [
    "SMA_50",
    "EMA_20",
    "EMA_10",
    "volatility",
    "momentum",
    "RSI",
    "volume_change",
    "returns"
]

def generate_reason(indicators: dict, signal: str):
    reasons = []
    # Trend logic
    if indicators.get("ema_10") is not None and indicators.get("ema_20") is not None:
        if indicators.get("ema_10") > indicators.get("ema_20"):
            reasons.append("short-term uptrend detected")
        else:
            reasons.append("weak or downward trend")
    # RSI logic
    rsi = indicators.get("rsi")
    if rsi is not None:
        if rsi < 30:
            reasons.append("RSI indicates oversold (potential reversal)")
        elif rsi > 70:
            reasons.append("RSI indicates overbought conditions")
    # Momentum
    if indicators.get("momentum") is not None:
        if indicators.get("momentum", 0) > 0:
            reasons.append("positive momentum observed")
        else:
            reasons.append("low or negative momentum")
    return ", ".join(reasons)

def get_top_factors(indicators: dict):
    return feature_importance_order[:3]
import pandas as pd

from ml.predict_signal import predict_signal


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculate RSI (Relative Strength Index) for a price series."""
    if period <= 0:
        raise ValueError('RSI period must be a positive integer.')

    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    rsi = rsi.fillna(0)
    rsi = rsi.clip(lower=0, upper=100)

    return rsi


def score_signal(rsi: float, price: float, ema: float, volume: float, avg_volume: float):
    """Calculate market signal and confidence data from indicators."""
    reasoning = []
    score = 50

    is_rsi_buy = rsi < 30
    is_rsi_sell = rsi > 70
    is_price_above_ema = price > ema
    is_price_below_ema = price < ema

    if is_rsi_buy and is_price_above_ema:
        signal = 'BUY'
        reasoning.append('RSI indicates oversold condition')
        reasoning.append('Price above EMA suggests upward trend')
        score += 20
        score += 15
    elif is_rsi_sell and is_price_below_ema:
        signal = 'SELL'
        reasoning.append('RSI indicates overbought condition')
        reasoning.append('Price below EMA suggests downward trend')
        score += 20
        score += 15
    else:
        signal = 'WATCH'
        if is_rsi_buy:
            reasoning.append('RSI indicates oversold condition')
            score += 20
        elif is_rsi_sell:
            reasoning.append('RSI indicates overbought condition')
            score += 20

        if is_price_above_ema:
            reasoning.append('Price above EMA suggests upward trend')
            score += 15
        elif is_price_below_ema:
            reasoning.append('Price below EMA suggests downward trend')
            score += 15

    volume_spike = False
    if avg_volume > 0 and volume > (1.5 * avg_volume):
        volume_spike = True
        reasoning.append('Volume spike confirms strength')
        score += 15

    score = min(100, max(0, int(score)))

    return {
        'signal': signal,
        'confidence': score,
        'reasoning': reasoning,
        'volume_spike': volume_spike,
    }


def generate_signal(indicators: dict):
    """Generate trading signal using ML model from indicators dict."""
    try:
        features = {
            "RSI": indicators.get("rsi"),
            "EMA_10": indicators.get("ema_10"),
            "EMA_20": indicators.get("ema_20"),
            "SMA_50": indicators.get("sma_50"),
            "returns": indicators.get("returns"),
            "volume_change": indicators.get("volume_change"),
            "volatility": indicators.get("volatility"),
            "momentum": indicators.get("momentum"),
        }

        result = predict_signal(features)
        reason = generate_reason(indicators, result["signal"])
        top_factors = get_top_factors(indicators)
        return {
            "type": result["signal"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "reason": reason,
            "top_factors": top_factors,
            "source": "ml_model"
        }

    except Exception as e:
        # fallback to rule-based logic
        reason = generate_reason(indicators, "WATCH")
        top_factors = get_top_factors(indicators)
        return {
            "type": "WATCH",
            "confidence": 0.5,
            "probabilities": {"buy": 0.0, "sell": 0.0, "watch": 1.0},
            "reason": reason or "fallback due to error",
            "top_factors": top_factors,
            "source": "fallback"
        }
