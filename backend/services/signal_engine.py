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


def _classify_strength(signal: str, confidence: float) -> str:
    if signal in {"BUY", "SELL"} and confidence >= 0.55:
        return "STRONG"
    return "NORMAL"


def _rule_based_signal(indicators: dict) -> tuple[str, float]:
    rsi = indicators.get("rsi")
    ema_10 = indicators.get("ema_10")
    ema_20 = indicators.get("ema_20")
    momentum = indicators.get("momentum")
    returns = indicators.get("returns")

    bullish_bias = (
        rsi is not None
        and ema_10 is not None
        and ema_20 is not None
        and momentum is not None
        and rsi <= 45
        and ema_10 >= ema_20
        and momentum >= 0
    )

    bearish_bias = (
        rsi is not None
        and ema_10 is not None
        and ema_20 is not None
        and momentum is not None
        and rsi >= 55
        and ema_10 <= ema_20
        and momentum <= 0
    )

    if bullish_bias:
        confidence = 0.58
        if returns is not None and returns > 0:
            confidence = 0.62
        return "BUY", confidence

    if bearish_bias:
        confidence = 0.58
        if returns is not None and returns < 0:
            confidence = 0.62
        return "SELL", confidence

    return "WATCH", 0.50


def generate_signal(indicators: dict):
    """Generate trading signal using ML model from indicators dict."""
    top_factors = get_top_factors(indicators)

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
        signal = result["signal"]
        confidence = float(result["confidence"])
        rule_signal, rule_confidence = _rule_based_signal(indicators)

        if signal == "WATCH" and rule_signal != "WATCH":
            signal = rule_signal
            confidence = max(confidence, rule_confidence)

        strength = _classify_strength(signal, confidence)
        reason = generate_reason(indicators, signal)
        probabilities = result.get("probabilities", {"buy": 0.0, "sell": 0.0, "watch": 1.0})

        return {
            "type": signal,
            "confidence": confidence,
            "strength": strength,
            "probabilities": probabilities,
            "reason": reason,
            "top_factors": top_factors,
            "source": "ml_model"
        }

    except Exception as e:
        signal, confidence = _rule_based_signal(indicators)
        strength = _classify_strength(signal, confidence)
        reason = generate_reason(indicators, signal)
        return {
            "type": signal,
            "confidence": confidence,
            "strength": strength,
            "probabilities": {"buy": 0.0, "sell": 0.0, "watch": 1.0},
            "reason": reason or "fallback due to error",
            "top_factors": top_factors,
            "source": "fallback"
        }
