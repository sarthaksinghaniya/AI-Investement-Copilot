import os
from typing import List

import numpy as np
import pandas as pd
import yfinance as yf

SYMBOLS = [
    "TCS.NS",
    "INFY.NS",
    "RELIANCE.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "SBIN.NS",
    "LT.NS",
    "ITC.NS",
]


def fetch_all_data(symbols: List[str] = SYMBOLS, period: str = "3y", interval: str = "1d") -> pd.DataFrame:
    frames = []
    for symbol in symbols:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval, auto_adjust=False)
        if df.empty:
            print(f"Warning: no data for {symbol}")
            continue

        df = df[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        df['symbol'] = symbol
        df['date'] = df.index
        frames.append(df)

    if not frames:
        raise RuntimeError('No data fetched for any symbol.')

    combined = pd.concat(frames, ignore_index=True)
    combined.sort_values(['symbol', 'date'], inplace=True)
    combined.reset_index(drop=True, inplace=True)
    return combined


def calculate_rsi(close: pd.Series, period: int = 14) -> pd.Series:
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    output_frames = []
    for symbol, group in df.groupby('symbol'):
        g = group.copy()
        g['RSI'] = calculate_rsi(g['Close'], period=14)
        g['EMA_10'] = g['Close'].ewm(span=10, adjust=False).mean()
        g['EMA_20'] = g['Close'].ewm(span=20, adjust=False).mean()
        g['SMA_50'] = g['Close'].rolling(window=50, min_periods=50).mean()
        g['returns'] = g['Close'].pct_change()
        g['volume_change'] = g['Volume'].pct_change()
        g['volatility'] = g['returns'].rolling(window=10, min_periods=10).std()
        g['momentum'] = g['Close'] - g['Close'].shift(10)
        g['future_return'] = (g['Close'].shift(-7) - g['Close']) / g['Close']
        output_frames.append(g)

    combined = pd.concat(output_frames, ignore_index=True)
    return combined


def create_labels(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['label'] = 'WATCH'
    df.loc[df['future_return'] > 0.03, 'label'] = 'BUY'
    df.loc[df['future_return'] < -0.03, 'label'] = 'SELL'
    return df


def save_dataset(df: pd.DataFrame, output_path: str = 'ml/data/dataset.csv') -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)


def build_dataset(symbols: List[str] = SYMBOLS, period: str = '3y') -> pd.DataFrame:
    raw = fetch_all_data(symbols=symbols, period=period)
    features = compute_features(raw)
    labeled = create_labels(features)

    keep_cols = [
        'symbol', 'date', 'RSI', 'EMA_10', 'EMA_20', 'SMA_50',
        'returns', 'volume_change', 'volatility', 'momentum', 'future_return', 'label'
    ]

    dataset = labeled[keep_cols].replace([np.inf, -np.inf], np.nan).dropna().reset_index(drop=True)

    print(f'Dataset size: {len(dataset)} rows')
    save_dataset(dataset)
    return dataset


if __name__ == '__main__':
    dataset = build_dataset()
    print(f'Dataset built with {len(dataset)} rows. Saved to ml/data/dataset.csv')
