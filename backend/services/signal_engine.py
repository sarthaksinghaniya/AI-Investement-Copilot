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


def generate_signal(df: pd.DataFrame) -> dict:
    """Generate trading signal from historical dataframe with indicators."""
    required = {'Close', 'Volume', 'SMA_20', 'EMA_20'}
    if not required.issubset(df.columns):
        missing = required - set(df.columns)
        raise ValueError(f'Missing required columns for signal engine: {missing}')

    if df.empty:
        raise ValueError('Dataframe must not be empty.')

    working = df.copy()

    if 'RSI_14' not in working.columns:
        working['RSI_14'] = calculate_rsi(working['Close'], period=14)

    latest = working.iloc[-1]

    features = {
        'RSI': float(latest['RSI_14']),
        'EMA_10': float(latest.get('EMA_10', latest['EMA_20'])),
        'EMA_20': float(latest['EMA_20']),
        'SMA_50': float(latest.get('SMA_50', latest.get('SMA_20', latest['Close']))),
        'volume_change': float(latest.get('volume_change', 0.0)),
        'returns': float(latest.get('returns', 0.0)),
    }

    try:
        ml_result = predict_signal(features)
        signal = ml_result.get('signal', 'WATCH')
        confidence = float(ml_result.get('confidence', 0.0))

        return {
            'signal': signal,
            'confidence': confidence,
            'reason': 'based on ML model + indicators',
        }

    except Exception:
        # fallback to rule-based signal when ML model fails
        avg_volume = float(working['Volume'].mean())
        rule = score_signal(
            rsi=float(latest['RSI_14']),
            price=float(latest['Close']),
            ema=float(latest['EMA_20']),
            volume=float(latest['Volume']),
            avg_volume=avg_volume,
        )

        return {
            'signal': rule['signal'],
            'confidence': float(rule['confidence']) / 100.0,
            'reason': 'fallback to rule-based model',
        }
