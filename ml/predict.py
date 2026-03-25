import os
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import pickle

MODEL_PATH = os.path.join('models', 'lstm_model.h5')
SCALER_PATH = os.path.join('models', 'scaler.pkl')


def _load_assets():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        raise FileNotFoundError('Model or scaler not found. Run ml/train_model.py first.')

    model = load_model(MODEL_PATH)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    return model, scaler


def _get_last_close(symbol: str, days: int = 60) -> np.ndarray:
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=f'{days}d', interval='1d', auto_adjust=False)
    if df.empty or len(df) < days:
        raise ValueError(f'Insufficient data for {symbol} to predict')
    close = df['Close'].dropna().tail(days).values.reshape(-1, 1)
    if len(close) < days:
        raise ValueError(f'Not enough close points for {symbol} (required {days})')
    return close


def predict_prices(symbol: str) -> dict:
    model, scaler = _load_assets()
    last_data = _get_last_close(symbol, days=60)

    scaled_data = scaler.transform(last_data)
    seq = scaled_data.copy()

    predictions = []
    for _ in range(7):
        x_input = seq[-60:].reshape(1, 60, 1)
        pred_scaled = model.predict(x_input, verbose=0)
        seq = np.vstack((seq, pred_scaled))
        pred = scaler.inverse_transform(pred_scaled)[0, 0]
        predictions.append(float(pred))

    current_price = float(last_data[-1, 0])
    final_pred = predictions[-1]
    if final_pred > current_price * 1.01:
        trend = 'UP'
    elif final_pred < current_price * 0.99:
        trend = 'DOWN'
    else:
        trend = 'SIDEWAYS'

    variance = float(np.var(predictions))
    confidence = max(0.0, min(1.0, 1.0 - (variance / (current_price ** 2 + 1e-9))))

    return {
        'predictions': predictions,
        'trend': trend,
        'confidence': round(confidence, 4),
    }
