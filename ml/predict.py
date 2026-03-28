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


def predict_future(model, last_sequence, steps=15):
    """
    Generate future price predictions using LSTM model.
    
    Args:
        model: Trained LSTM model
        last_sequence: Last sequence of actual prices (scaled)
        steps: Number of future steps to predict (default: 15)
    
    Returns:
        List of predicted prices (inverse-transformed to original scale)
    """
    import numpy as np
    
    predictions = []
    current_seq = last_sequence.copy()
    
    for _ in range(steps):
        # Reshape for model input
        x_input = current_seq[-60:].reshape(1, -1, 1)
        
        # Get prediction
        pred_scaled = model.predict(x_input, verbose=0)[0][0]
        
        # Inverse transform to get actual price
        pred_actual = scaler.inverse_transform([[pred_scaled]])[0][0]
        predictions.append(float(pred_actual))
        
        # Update sequence with new prediction (sliding window)
        current_seq = np.append(current_seq[1:], pred_scaled)
    
    return predictions


def predict_prices(symbol: str) -> dict:
    model, scaler = _load_assets()
    last_data = _get_last_close(symbol, days=60)

    scaled_data = scaler.transform(last_data)
    seq = scaled_data.copy()

    # Generate 7-day predictions (existing functionality)
    predictions = []
    for _ in range(7):
        x_input = seq[-60:].reshape(1, 60, 1)
        pred_scaled = model.predict(x_input, verbose=0)
        seq = np.vstack((seq, pred_scaled))
        pred = scaler.inverse_transform(pred_scaled)[0, 0]
        predictions.append(float(pred))

    # Generate 15-day future predictions (new functionality)
    future_predictions = predict_future(model, scaled_data, steps=15)

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
        'future_predictions': future_predictions,  # NEW: 15-day future predictions
        'trend': trend,
        'confidence': round(confidence, 4),
    }
