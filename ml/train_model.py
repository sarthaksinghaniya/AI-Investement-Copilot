import os
import datetime
import json
import pickle
import yfinance as yf
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import ModelCheckpoint


def _ensure_output_dirs(run_dir: str):
    subdirs = ['logs', 'models', 'plots', 'metrics']
    for sub in subdirs:
        os.makedirs(os.path.join(run_dir, sub), exist_ok=True)


def _get_run_dir():
    now = datetime.datetime.utcnow()
    run_id = now.strftime('run_%Y%m%d_%H%M%S')
    path = os.path.join('outputs', run_id)
    os.makedirs(path, exist_ok=True)
    _ensure_output_dirs(path)
    return path


def fetch_close_prices(symbol: str, period: str = '1y') -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval='1d', auto_adjust=False)
    if df.empty:
        raise ValueError(f'No historical data for {symbol}')
    return df[['Close']].dropna()


def create_sequences(data: np.ndarray, seq_len: int = 60):
    x, y = [], []
    for i in range(seq_len, len(data)):
        x.append(data[i - seq_len:i, 0])
        y.append(data[i, 0])
    x, y = np.array(x), np.array(y)
    x = np.reshape(x, (x.shape[0], x.shape[1], 1))
    return x, y


def build_model(input_shape):
    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=input_shape))
    model.add(LSTM(50))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model


def _save_training_log(run_dir: str, epochs: int, history):
    path = os.path.join(run_dir, 'logs', 'training_log.txt')
    with open(path, 'w') as f:
        f.write(f'Timestamp: {datetime.datetime.utcnow().isoformat()}\n')
        f.write(f'Epochs: {epochs}\n')
        f.write('loss\n')
        for idx, value in enumerate(history.history['loss'], start=1):
            f.write(f'{idx},{value}\n')


def _plot_loss_curve(run_dir: str, history):
    plt.figure(figsize=(8, 5))
    plt.plot(history.history['loss'], label='loss')
    plt.title('Loss vs Epochs')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    path = os.path.join(run_dir, 'plots', 'loss_curve.png')
    plt.savefig(path)
    plt.close()


def _plot_prediction_vs_actual(run_dir: str, actual, predicted):
    plt.figure(figsize=(10, 6))
    plt.plot(actual, label='Actual', color='blue')
    plt.plot(predicted, label='Predicted', color='orange')
    plt.title('Prediction vs Actual (last 100 points)')
    plt.xlabel('Time')
    plt.ylabel('Close Price')
    plt.legend()
    plt.grid(True)
    path = os.path.join(run_dir, 'plots', 'prediction_vs_actual.png')
    plt.savefig(path)
    plt.close()


def _save_metrics(run_dir: str, mse: float, rmse: float):
    metric = {'mse': float(mse), 'rmse': float(rmse)}
    path = os.path.join(run_dir, 'metrics', 'metrics.json')
    with open(path, 'w') as f:
        json.dump(metric, f, indent=2)


def train_model(symbol: str = 'TCS.NS', epochs: int = 5, batch_size: int = 32):
    run_dir = _get_run_dir()

    df = fetch_close_prices(symbol, period='1y')
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df.values)

    x_train, y_train = create_sequences(scaled_data, seq_len=60)

    model = build_model((x_train.shape[1], 1))

    checkpoint_path = os.path.join(run_dir, 'models', 'best_model.h5')
    checkpoint = ModelCheckpoint(checkpoint_path, monitor='loss', save_best_only=True, mode='min', verbose=1)

    history = model.fit(
        x_train,
        y_train,
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[checkpoint],
        verbose=1,
    )

    # Save final model and scaler for production
    final_model_path = os.path.join(run_dir, 'models', 'lstm_model.h5')
    model.save(final_model_path)

    scaler_path = os.path.join(run_dir, 'models', 'scaler.pkl')
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)

    # Logging
    _save_training_log(run_dir, epochs, history)

    # plots
    _plot_loss_curve(run_dir, history)

    # Prediction vs actual on last 100 points from training set
    if len(x_train) > 100:
        sample_x = x_train[-100:]
        sample_y = y_train[-100:]
    else:
        sample_x = x_train
        sample_y = y_train

    predicted_scaled = model.predict(sample_x, verbose=0)
    predicted = scaler.inverse_transform(predicted_scaled)

    actual_scaled = sample_y.reshape(-1, 1)
    actual = scaler.inverse_transform(actual_scaled)

    _plot_prediction_vs_actual(run_dir, actual.flatten(), predicted.flatten())

    mse = mean_squared_error(actual, predicted)
    rmse = np.sqrt(mse)
    _save_metrics(run_dir, mse, rmse)

    print(f'Training complete. Outputs are in {run_dir}')

    return {
        'run_dir': run_dir,
        'model': final_model_path,
        'checkpoint': checkpoint_path,
        'scaler': scaler_path,
        'metrics': {'mse': mse, 'rmse': rmse},
    }


if __name__ == '__main__':
    print('Training model for TCS.NS')
    train_model('TCS.NS')
    print('Training complete')
