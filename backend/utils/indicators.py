import pandas as pd


def calculate_sma(series: pd.Series, window: int = 20) -> pd.Series:
    """Calculate Simple Moving Average (SMA) with the given window."""
    if window <= 0:
        raise ValueError('Window must be a positive integer.')
    return series.rolling(window=window, min_periods=window).mean()


def calculate_ema(series: pd.Series, window: int = 20) -> pd.Series:
    """Calculate Exponential Moving Average (EMA) with the given window."""
    if window <= 0:
        raise ValueError('Window must be a positive integer.')
    return series.ewm(span=window, adjust=False, min_periods=window).mean()
