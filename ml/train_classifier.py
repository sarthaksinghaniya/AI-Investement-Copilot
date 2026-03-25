import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier


def load_dataset(path: str = "ml/data/dataset.csv") -> pd.DataFrame:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}. Run ml/build_dataset.py first.")
    return pd.read_csv(path)


def prepare_data(df: pd.DataFrame):
    X = df[["RSI", "EMA_10", "EMA_20", "SMA_50", "returns", "volume_change", "volatility", "momentum"]]
    y = df["label"].map({'BUY': 0, 'SELL': 1, 'WATCH': 2})
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)


def train_classifier(X_train, y_train):
    class_counts = y_train.value_counts()
    total = len(y_train)
    class_weights = {cls: total / (len(class_counts) * count) for cls, count in class_counts.items()}

    # map series labels to weights
    sample_weights = y_train.map(class_weights)

    clf = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='mlogloss',
        random_state=42,
        use_label_encoder=False,
    )
    clf.fit(X_train, y_train, sample_weight=sample_weights)
    return clf


def evaluate_classifier(clf, X_test, y_test):
    proba = clf.predict_proba(X_test)
    # numeric mapping: 0=BUY,1=SELL,2=WATCH
    prob_df = pd.DataFrame(proba, columns=['BUY', 'SELL', 'WATCH'])

    def apply_threshold(row):
        if row['BUY'] > 0.4:
            return 'BUY'
        if row['SELL'] > 0.4:
            return 'SELL'
        return 'WATCH'

    y_pred = prob_df.apply(apply_threshold, axis=1)

    mapping = {0: 'BUY', 1: 'SELL', 2: 'WATCH'}
    y_true = y_test.map(mapping)

    acc = accuracy_score(y_true, y_pred)
    report = classification_report(y_true, y_pred, output_dict=True)
    cm = confusion_matrix(y_true, y_pred, labels=['BUY', 'SELL', 'WATCH'])

    class_counts = y_true.value_counts().to_dict()

    recall_buy = report.get('BUY', {}).get('recall', 0)
    recall_sell = report.get('SELL', {}).get('recall', 0)

    return {
        "accuracy": acc,
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
        "class_distribution": class_counts,
        "y_pred": y_pred,
        "recall_buy": recall_buy,
        "recall_sell": recall_sell,
    }


def save_model(clf, path: str = "ml/models/classifier.pkl") -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(clf, path)


def save_metrics(metrics: dict, path: str = "ml/outputs/metrics/classifier_metrics.json") -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    sanitized = {
        'accuracy': float(metrics['accuracy']),
        'classification_report': metrics['classification_report'],
        'confusion_matrix': metrics['confusion_matrix'],
        'class_distribution': {k: int(v) for k, v in metrics['class_distribution'].items()},
    }
    with open(path, "w") as f:
        json.dump(sanitized, f, indent=2)


def print_feature_importance(clf, feature_names):
    fi = clf.feature_importances_
    importance_data = sorted(zip(feature_names, fi), key=lambda x: x[1], reverse=True)
    print("Feature Importance:")
    for feat, score in importance_data:
        print(f" - {feat}: {score:.4f}")
    return importance_data


def main():
    df = load_dataset()
    X_train, X_test, y_train, y_test = prepare_data(df)

    clf = train_classifier(X_train, y_train)

    metrics = evaluate_classifier(clf, X_test, y_test)

    y_test_labels = y_test.map({0:'BUY',1:'SELL',2:'WATCH'})

    print(f"Test accuracy: {metrics['accuracy']:.4f}")
    print("Class distribution:", metrics['class_distribution'])
    print("BUY recall:", metrics.get('recall_buy'))
    print("SELL recall:", metrics.get('recall_sell'))
    print("Classification report:")
    print(classification_report(y_test_labels, metrics['y_pred']))
    print("Confusion matrix:")
    print(pd.DataFrame(metrics['confusion_matrix'], index=['BUY', 'SELL', 'WATCH'], columns=['BUY', 'SELL', 'WATCH']))

    importance_data = print_feature_importance(clf, X_train.columns.tolist())

    save_model(clf)
    save_metrics(metrics)

    print("Model and metrics saved.")
    print("Top 5 features:")
    for feat, score in importance_data[:5]:
        print(f" - {feat}: {score:.4f}")


if __name__ == "__main__":
    main()
