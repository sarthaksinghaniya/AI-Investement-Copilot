import os
import joblib

MODEL_PATH = os.path.join('ml', 'models', 'classifier.pkl')


def load_model(path: str = MODEL_PATH):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Classifier model not found at {path}. Run ml/train_classifier.py first.")
    return joblib.load(path)


def predict_signal(features_dict: dict):
    required = ["RSI", "EMA_10", "EMA_20", "SMA_50", "volume_change", "returns", "volatility", "momentum"]
    missing = [f for f in required if f not in features_dict]
    if missing:
        raise ValueError(f"Missing features: {', '.join(missing)}")

    clf = load_model()

    # ensure order is consistent with training
    x = [[
        float(features_dict["RSI"]),
        float(features_dict["EMA_10"]),
        float(features_dict["EMA_20"]),
        float(features_dict["SMA_50"]),
        float(features_dict["returns"]),
        float(features_dict["volume_change"]),
        float(features_dict["volatility"]),
        float(features_dict["momentum"]),
    ]]

    proba = clf.predict_proba(x)[0]

    # XGBoost or sklearn classes should include BUY/SELL/WATCH among clf.classes_
    # Class labels in XGB are numeric (0,1,2) for BUY/SELL/WATCH
    label_mapping = {0: 'BUY', 1: 'SELL', 2: 'WATCH'}
    prob_map = {label_mapping.get(int(clf.classes_[i]), 'WATCH'): float(proba[i]) for i in range(len(proba))}

    prob_buy = prob_map.get('BUY', 0.0)
    prob_sell = prob_map.get('SELL', 0.0)
    prob_watch = prob_map.get('WATCH', 0.0)

    if prob_buy > 0.45:
        signal = 'BUY'
    elif prob_sell > 0.45:
        signal = 'SELL'
    else:
        signal = 'WATCH'

    confidence = max(prob_buy, prob_sell, prob_watch)

    return {
        'signal': signal,
        'confidence': float(confidence),
        'probabilities': {
            'buy': float(prob_buy),
            'sell': float(prob_sell),
            'watch': float(prob_watch),
        },
    }


if __name__ == '__main__':
    sample = {
        "RSI": 45.0,
        "EMA_10": 3100.0,
        "EMA_20": 3080.0,
        "SMA_50": 3050.0,
        "volume_change": 2.5,
        "returns": 0.3,
        "volatility": 0.01,
        "momentum": 50.0,
    }
    print(predict_signal(sample))