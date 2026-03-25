import os
from typing import Tuple

import pandas as pd
import yfinance as yf


def fetch_stock_data(symbol: str = "TCS.NS", period: str = "2y", interval: str = "1d") -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval, auto_adjust=False)
    if df.empty:
        raise ValueError(f"No data returned for symbol {symbol}")
    return df


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
    df = df.copy()
    df["RSI"] = calculate_rsi(df["Close"], period=14)
    df["EMA_10"] = df["Close"].ewm(span=10, adjust=False).mean()
    df["EMA_20"] = df["Close"].ewm(span=20, adjust=False).mean()
    df["SMA_50"] = df["Close"].rolling(window=50, min_periods=50).mean()
    df["volume_change"] = df["Volume"].pct_change() * 100
    df["returns"] = df["Close"].pct_change() * 100
    return df


def create_labels(df: pd.DataFrame, horizon: int = 5, up_th: float = 0.02, down_th: float = -0.02) -> pd.DataFrame:
    df = df.copy()
    df["future_close"] = df["Close"].shift(-horizon)
    df["future_return"] = (df["future_close"] - df["Close"]) / df["Close"]

    conditions = [
        df["future_return"] > up_th,
        df["future_return"] < down_th,
    ]
    choices = ["BUY", "SELL"]
    df["label"] = pd.Series(pd.Categorical(pd.cut(df["future_return"], bins=[-float("inf"), down_th, up_th, float("inf")], labels=["SELL", "WATCH", "BUY"])))

    # overwrite with explicit values if intervals were not clear
    df.loc[df["future_return"] > up_th, "label"] = "BUY"
    df.loc[df["future_return"] < down_th, "label"] = "SELL"
    df.loc[(df["future_return"] <= up_th) & (df["future_return"] >= down_th), "label"] = "WATCH"

    return df


def _ensure_data_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def build_dataset(symbol: str = "TCS.NS", period: str = "2y", output_path: str = "ml/data/dataset.csv") -> pd.DataFrame:
    df = fetch_stock_data(symbol=symbol, period=period)
    df = compute_features(df)
    df = create_labels(df)

    keep_cols = ["RSI", "EMA_10", "EMA_20", "SMA_50", "volume_change", "returns", "label"]
    df = df[keep_cols]
    df = df.dropna()

    _ensure_data_dir(os.path.dirname(output_path))
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    dataset = build_dataset()
    print(f"Dataset built with {len(dataset)} rows. Saved to ml/data/dataset.csv")
