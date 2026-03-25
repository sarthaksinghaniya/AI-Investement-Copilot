import os
import json
import datetime
import pandas as pd
import yfinance as yf
from predict_signal import predict_signal


def fetch_stock_data(symbol: str) -> pd.DataFrame:
    """Fetch last 3 months of daily data for a stock symbol."""
    ticker = yf.Ticker(symbol)
    df = ticker.history(period="3mo", interval="1d")
    return df


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Compute technical indicators for the dataframe."""
    df = df.copy()

    # RSI calculation
    def rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.rolling(window=period).mean()
        avg_loss = loss.rolling(window=period).mean()
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    df['RSI'] = rsi(df['Close'])
    df['EMA_10'] = df['Close'].ewm(span=10, adjust=False).mean()
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    df['returns'] = df['Close'].pct_change()
    df['volume_change'] = df['Volume'].pct_change()
    df['volatility'] = df['returns'].rolling(window=10).std()
    df['momentum'] = df['Close'] - df['Close'].shift(10)

    return df


def main():
    symbols = [
        "TCS.NS", "INFY.NS", "RELIANCE.NS",
        "HDFCBANK.NS", "ICICIBANK.NS",
        "SBIN.NS", "LT.NS", "ITC.NS"
    ]

    results = []

    for symbol in symbols:
        df = fetch_stock_data(symbol)
        if df.empty:
            continue

        df = compute_indicators(df)
        last_row = df.iloc[-1]

        features = {
            'RSI': last_row['RSI'],
            'EMA_10': last_row['EMA_10'],
            'EMA_20': last_row['EMA_20'],
            'SMA_50': last_row['SMA_50'],
            'returns': last_row['returns'],
            'volume_change': last_row['volume_change'],
            'volatility': last_row['volatility'],
            'momentum': last_row['momentum'],
        }

        # Handle NaN values
        for key, value in features.items():
            if pd.isna(value):
                features[key] = 0.0

        result = predict_signal(features)

        res = {
            'symbol': symbol,
            'signal': result['signal'],
            'confidence': result['confidence'],
            'buy_prob': result['probabilities']['buy'],
            'sell_prob': result['probabilities']['sell'],
            'watch_prob': result['probabilities']['watch'],
        }

        results.append(res)

    # Create output directory
    output_dir = 'ml/outputs/test_results'
    os.makedirs(output_dir, exist_ok=True)

    # Save JSON
    json_path = os.path.join(output_dir, 'signals.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)

    # Save CSV
    csv_path = os.path.join(output_dir, 'signals.csv')
    df_results = pd.DataFrame(results)
    df_results.to_csv(csv_path, index=False)

    # Distribution analysis
    total = len(results)
    buy_count = sum(1 for r in results if r['signal'] == 'BUY')
    sell_count = sum(1 for r in results if r['signal'] == 'SELL')
    watch_count = sum(1 for r in results if r['signal'] == 'WATCH')

    print("Signal Distribution:")
    print(f"BUY: {buy_count/total*100:.1f}%")
    print(f"SELL: {sell_count/total*100:.1f}%")
    print(f"WATCH: {watch_count/total*100:.1f}%")

    # Print table
    print("\nSymbol | Signal | Confidence")
    for r in results:
        print(f"{r['symbol']} | {r['signal']} | {r['confidence']:.2f}")


if __name__ == '__main__':
    main()