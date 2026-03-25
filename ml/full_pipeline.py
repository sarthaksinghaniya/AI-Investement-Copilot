import os
import json
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split


TICKERS = [
    "TCS.NS",
    "INFY.NS",
    "RELIANCE.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "SBIN.NS",
    "LT.NS",
    "ITC.NS",
]

MODEL_PATH = Path("ml/models/classifier.pkl")
METRICS_PATH = Path("ml/outputs/metrics/metrics.json")
CM_PLOT = Path("ml/outputs/plots/confusion_matrix.png")
FI_PLOT = Path("ml/outputs/plots/feature_importance.png")


def ensure_dirs():
    for path in [MODEL_PATH.parent, METRICS_PATH.parent, CM_PLOT.parent]:
        path.mkdir(parents=True, exist_ok=True)


def fetch_data(tickers=TICKERS, period="3y") -> pd.DataFrame:
    frames = []
    for symbol in tickers:
        df = yf.Ticker(symbol).history(period=period, interval="1d", auto_adjust=False)
        if df.empty:
            continue
        df = df[['Open', 'High', 'Low', 'Close', 'Volume']].copy()
        df['symbol'] = symbol
        df['date'] = df.index
        frames.append(df)
    if not frames:
        raise RuntimeError("No data fetched for any ticker")
    return pd.concat(frames, ignore_index=True)


def compute_indicators(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.sort_values(['symbol', 'date'], inplace=True)

    def _calc(series):
        output = pd.DataFrame(index=series.index)
        output['RSI'] = _rsi(series['Close'], 14)
        output['EMA_10'] = series['Close'].ewm(span=10, adjust=False).mean()
        output['EMA_20'] = series['Close'].ewm(span=20, adjust=False).mean()
        output['SMA_50'] = series['Close'].rolling(window=50, min_periods=50).mean()
        output['returns'] = series['Close'].pct_change()
        output['volume_change'] = series['Volume'].pct_change()
        output['volatility'] = output['returns'].rolling(window=10, min_periods=10).std()
        output['momentum'] = series['Close'] - series['Close'].shift(10)
        output['future_return'] = (series['Close'].shift(-7) - series['Close']) / series['Close']
        return output

    all_frames = []
    for symbol, group in df.groupby('symbol'):
        ind = _calc(group)
        ind['symbol'] = symbol
        ind['date'] = group['date']
        ind['Close'] = group['Close'].values
        all_frames.append(ind)

    result = pd.concat(all_frames, ignore_index=True)

    conditions = [
        result['future_return'] > 0.03,
        result['future_return'] < -0.03,
    ]
    choices = ['BUY', 'SELL']
    result['label'] = np.select(conditions, choices, default='WATCH')

    return result


def _rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=period, min_periods=period).mean()
    avg_loss = loss.rolling(window=period, min_periods=period).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def build_dataset(df: pd.DataFrame) -> pd.DataFrame:
    keep_cols = ['symbol', 'date', 'RSI', 'EMA_10', 'EMA_20', 'SMA_50', 'returns', 'volume_change', 'volatility', 'momentum', 'future_return', 'label']
    dataset = df[keep_cols].replace([np.inf, -np.inf], np.nan).dropna().copy()
    return dataset


def train_evaluate(dataset: pd.DataFrame):
    X = dataset[['RSI', 'EMA_10', 'EMA_20', 'SMA_50', 'returns', 'volume_change', 'volatility', 'momentum']]
    y = dataset['label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        class_weight='balanced',
        random_state=42,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred, labels=['BUY', 'SELL', 'WATCH'])

    fi = sorted(zip(X.columns.tolist(), clf.feature_importances_), key=lambda x: x[1], reverse=True)

    return {
        'model': clf,
        'accuracy': acc,
        'classification_report': report,
        'confusion_matrix': cm.tolist(),
        'feature_importance': fi,
        'X_test': X_test,
        'y_test': y_test,
        'y_pred': y_pred,
    }


def plot_confusion_matrix(cm, labels=['BUY', 'SELL', 'WATCH'], path=CM_PLOT):
    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(cm, cmap='Blues')
    plt.title('Confusion Matrix')
    fig.colorbar(cax)
    ax.set_xticks(range(len(labels)))
    ax.set_yticks(range(len(labels)))
    ax.set_xticklabels(labels)
    ax.set_yticklabels(labels)
    plt.xlabel('Predicted')
    plt.ylabel('Actual')

    for (i, j), val in np.ndenumerate(cm):
        ax.text(j, i, int(val), ha='center', va='center', color='red')

    plt.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def plot_feature_importance(fi, path=FI_PLOT):
    features, importances = zip(*fi)
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.barh(features[::-1], importances[::-1], color='teal')
    ax.set_xlabel('Feature Importance')
    ax.set_title('Feature Importance')
    plt.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def save_metrics(metrics: dict, path=METRICS_PATH):
    with open(path, 'w') as f:
        json.dump(metrics, f, indent=2)


def main():
    ensure_dirs()

    raw = fetch_data()
    engineered = compute_indicators(raw)
    dataset = build_dataset(engineered)

    print(f"Dataset size: {len(dataset)} rows")

    results = train_evaluate(dataset)

    joblib.dump(results['model'], MODEL_PATH)

    metrics = {
        'dataset_size': len(dataset),
        'accuracy': results['accuracy'],
        'classification_report': results['classification_report'],
        'confusion_matrix': results['confusion_matrix'],
        'feature_importance': [{ 'feature': f, 'importance': float(v)} for f, v in results['feature_importance']],
    }

    save_metrics(metrics)

    plot_confusion_matrix(np.array(metrics['confusion_matrix']))
    plot_feature_importance([(f['feature'], f['importance']) for f in metrics['feature_importance']])

    top5 = results['feature_importance'][:5]
    print(f"Accuracy: {results['accuracy']:.4f}")
    print("Top 5 features:")
    for feat, val in top5:
        print(f" - {feat}: {val:.4f}")


if __name__ == '__main__':
    main()
