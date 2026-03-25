# AI Investment Copilot

## Overview

A FastAPI-based AI Stock Advisor backend with:
- `/stock/{symbol}` endpoint (price, history, indicators, signal, prediction)
- `/copilot/chat` endpoint (rule-based natural language query)
- `/alerts` endpoint (proactive signal alerts)
- LSTM prediction engine (`ml/train_model.py`, `ml/predict.py`)
- in-memory caching and async alerts


## Project structure

```
backend/
  main.py
  routes/
    stock.py
    copilot.py
    alerts.py
  services/
    stock_service.py
    signal_engine.py
    copilot_service.py
    alerts_service.py
  utils/
    indicators.py
ml/
  train_model.py
  predict.py
models/
  lstm_model.h5
  scaler.pkl
requirements.txt
README.md
```


## Setup

1. Create venv & install dependencies:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

2. Train LSTM model once:

```bash
python ml/train_model.py
```

3. Start API:

```bash
cd backend
uvicorn main:app --reload
source venv/Scripts/activate && uvicorn backend.main:app --reload
```

## Endpoints

- `GET /stock/{symbol}`
  - returns symbol, latest_price, historical_data (last 30d OHLC+indicators), indicators, signal analysis, prediction block

- `POST /copilot/chat`
  - body: `{ "query": "Should I buy TCS?" }`
  - returns answer + details

- `GET /alerts`
  - returns active strong BUY/SELL alerts from sample stock universe


## Prediction engine

- `ml/train_model.py`: downloads 1 year close data, builds LSTM, saves model + scaler.
- `ml/predict.py`: generates 7-day forecasts and trend/confidence.
- integrated into `/stock/{symbol}` as `prediction` field.


## Notes

- caching TTL for stock_data = 60s
- alert dedupe TTL = 1h
- this is a PoC for backend behavior; model accuracy requires longer training and proper validation

## New ML pipeline (XGBoost signal classifier)

Added scripts:
- `ml/build_dataset.py` (multi-symbol dataset + engineering + labeling)
- `ml/train_classifier.py` (XGB classifier, thresholded BUY/SELL/WATCH, metrics output)

Run:

```bash
source venv/Scripts/activate
python ml/build_dataset.py
python ml/train_classifier.py
```

- model saved to `ml/models/classifier.pkl`
- metrics saved to `ml/outputs/metrics/classifier_metrics.json`
- improves BUY/SELL recall and overall accuracy

