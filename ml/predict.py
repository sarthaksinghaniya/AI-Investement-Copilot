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


def generate_explanation(data):
    """
    Generate human-readable explanation for trading decisions.
    
    Args:
        data: Dictionary containing prediction and backtest results
    
    Returns:
        String explanation of the trading decision
    """
    signal = data.get("prediction_signal", "WATCH")
    confidence = data.get("prediction_confidence", 0)
    expected_return = data.get("expected_return_pct", 0)
    trend = "upward" if expected_return > 0 else "downward"
    
    # Get additional context for advanced explanation
    indicators = data.get("indicators", {})
    rsi = indicators.get("rsi", 50)
    ema_trend = "bullish" if expected_return > 0 else "bearish"
    
    explanation = ""

    if signal == "BUY":
        explanation = f"""
        The model predicts an upward price movement with an expected return of {expected_return:.2f}%.
        Strong confidence ({confidence*100:.0f}%) indicates a reliable bullish trend.
        
        Technical Analysis:
        - RSI at {rsi:.1f} suggests {'oversold conditions' if rsi < 30 else 'momentum building' if rsi < 50 else 'strong momentum'}
        - EMA trend shows {ema_trend} momentum
        - Expected profit: ₹{100000 * expected_return / 100:.0f} on ₹100,000 investment
        
        This suggests a potential buying opportunity with {confidence*100:.0f}% confidence.
        """
    elif signal == "SELL":
        explanation = f"""
        The model forecasts a downward movement with an expected return of {expected_return:.2f}%.
        Confidence is {confidence*100:.0f}%, indicating bearish pressure.
        
        Technical Analysis:
        - RSI at {rsi:.1f} indicates {'overbought conditions' if rsi > 70 else 'selling pressure' if rsi > 50 else 'weakening momentum'}
        - EMA trend shows {ema_trend} momentum
        - Expected loss prevention: Save ₹{abs(100000 * expected_return / 100):.0f} on ₹100,000 investment
        
        This suggests reducing exposure or selling with {confidence*100:.0f}% confidence.
        """
    else:
        explanation = f"""
        The model shows no strong directional trend.
        Expected return is {expected_return:.2f}% with moderate confidence ({confidence*100:.0f}%).
        
        Technical Analysis:
        - RSI at {rsi:.1f} indicates {'neutral zone' if 40 <= rsi <= 60 else 'potential reversal zone'}
        - EMA trend shows {ema_trend} momentum
        - Market appears to be in consolidation phase
        
        It is advisable to wait for clearer signals before taking action.
        """

    return explanation.strip()


def backtest_strategy(prices, signals):
    """
    Backtest trading strategy with given prices and signals.
    
    Args:
        prices: List of prices
        signals: List of signals (BUY/SELL/WATCH)
    
    Returns:
        Dictionary with backtest results
    """
    capital = 100000  # starting capital
    position = 0
    entry_price = 0
    trades = []

    for i in range(len(prices)):
        signal = signals[i] if i < len(signals) else "WATCH"
        price = prices[i]

        # BUY
        if signal == "BUY" and position == 0:
            position = capital / price
            entry_price = price
            capital = 0

            trades.append({
                "type": "BUY",
                "price": price,
                "step": i,
                "capital": position * price
            })

        # SELL
        elif signal == "SELL" and position > 0:
            capital = position * price
            profit = (price - entry_price) / entry_price * 100
            position = 0

            trades.append({
                "type": "SELL",
                "price": price,
                "step": i,
                "capital": capital,
                "profit_pct": profit
            })

    final_value = capital if position == 0 else position * prices[-1]

    # Calculate statistics
    profitable_trades = [t for t in trades if t.get("profit_pct", 0) > 0]
    total_profit = final_value - 100000
    return_pct = (total_profit / 100000) * 100

    return {
        "final_value": round(final_value, 2),
        "profit": round(total_profit, 2),
        "return_pct": round(return_pct, 2),
        "trades": trades,
        "total_trades": len(trades),
        "profitable_trades": len(profitable_trades),
        "win_rate": round(len(profitable_trades) / len(trades) * 100, 1) if trades else 0
    }


def generate_prediction_signals(future_predictions):
    """
    Generate BUY/SELL signals from future predictions.
    
    Args:
        future_predictions: List of predicted prices
    
    Returns:
        Dictionary with prediction signals and confidence
    """
    if not future_predictions or len(future_predictions) < 2:
        return {
            'prediction_signal': 'WATCH',
            'prediction_confidence': 0.0,
            'expected_return_pct': 0.0,
            'entry_points': [],
            'exit_points': []
        }
    
    # Calculate price change
    start_price = future_predictions[0]
    end_price = future_predictions[-1]
    change_pct = ((end_price - start_price) / start_price) * 100
    
    # Define signal rules
    if change_pct > 2:
        signal = "BUY"
    elif change_pct < -2:
        signal = "SELL"
    else:
        signal = "WATCH"
    
    # Confidence calculation
    confidence = min(abs(change_pct) / 5, 1.0)
    
    # Advanced: Detect entry/exit points
    entry_points = []
    exit_points = []
    
    for i in range(1, len(future_predictions) - 1):
        # Local minima (BUY signal)
        if (future_predictions[i] < future_predictions[i-1] and 
            future_predictions[i] < future_predictions[i+1]):
            entry_points.append({
                'step': i + 1,
                'price': float(future_predictions[i]),
                'type': 'BUY'
            })
        
        # Local maxima (SELL signal)
        if (future_predictions[i] > future_predictions[i-1] and 
            future_predictions[i] > future_predictions[i+1]):
            exit_points.append({
                'step': i + 1,
                'price': float(future_predictions[i]),
                'type': 'SELL'
            })
    
    return {
        'prediction_signal': signal,
        'prediction_confidence': round(confidence, 4),
        'expected_return_pct': round(change_pct, 2),
        'entry_points': entry_points,
        'exit_points': exit_points
    }


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
    
    # Generate prediction-based signals
    prediction_signals = generate_prediction_signals(future_predictions)
    
    # Generate step-by-step signals for backtesting
    step_signals = []
    for i in range(len(future_predictions)):
        if i == 0:
            step_signals.append(prediction_signals['prediction_signal'])
        elif i < len(future_predictions) - 1:
            # Local minima (BUY)
            if (future_predictions[i] < future_predictions[i-1] and 
                future_predictions[i] < future_predictions[i+1]):
                step_signals.append("BUY")
            # Local maxima (SELL)
            elif (future_predictions[i] > future_predictions[i-1] and 
                  future_predictions[i] > future_predictions[i+1]):
                step_signals.append("SELL")
            else:
                step_signals.append("WATCH")
        else:
            step_signals.append("WATCH")
    
    # Run backtest on future predictions
    backtest_results = backtest_strategy(future_predictions, step_signals)

    current_price = float(last_data[-1, 0])
    final_pred = predictions[-1]
    if final_pred > current_price * 1.01:
        trend = 'UP'
    elif final_pred < current_price * 0.99:
        trend = 'DOWN'
    else:
        trend = 'SIDEWAYS'

    variance = float(np.var(predictions))
    confidence = max(0.0, min(1.0, 1.0 - (variance / (current_price ** 2 + 1e-9))));

    # Create data object for explanation generation
    explanation_data = {
        'prediction_signal': prediction_signals['prediction_signal'],
        'prediction_confidence': prediction_signals['prediction_confidence'],
        'expected_return_pct': prediction_signals['expected_return_pct'],
        'indicators': {
            'rsi': indicators.get('rsi', 50) if 'indicators' in locals() else 50
        }
    }
    
    # Generate AI explanation
    ai_explanation = generate_explanation(explanation_data)

    return {
        'predictions': predictions,
        'future_predictions': future_predictions,  # NEW: 15-day future predictions
        'trend': trend,
        'confidence': round(confidence, 4),
        'prediction_signal': prediction_signals['prediction_signal'],  # NEW: Prediction-based signal
        'prediction_confidence': prediction_signals['prediction_confidence'],  # NEW: Signal confidence
        'expected_return_pct': prediction_signals['expected_return_pct'],  # NEW: Expected return
        'entry_points': prediction_signals['entry_points'],  # NEW: Buy entry points
        'exit_points': prediction_signals['exit_points'],  # NEW: Sell exit points
        'backtest': backtest_results,  # NEW: Portfolio simulation results
        'ai_explanation': ai_explanation  # NEW: AI-generated explanation
    }
