import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
import warnings
warnings.filterwarnings("ignore")

FEATURE_COLS = [
    "Open_Price", "High_Price", "Low_Price", "Close_Price", "Volume",
    "SMA_7", "SMA_14", "SMA_50", "ATR_14", "RSI_14", "VWAP_14",
    "Dist_From_52W_High_Pct", "Volatility_20D", "Earnings_Flag"
]
TARGET_COL = "Target_Next_Day_Return_Pct"
SEQ_LEN = 20

def prepare_features(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    df = df.copy().dropna(subset=FEATURE_COLS + [TARGET_COL])
    df = df.reset_index(drop=True)
    
    X = df[FEATURE_COLS].values.astype(np.float32)
    y = df[TARGET_COL].values.astype(np.float32)
    prices = df["Close_Price"].values.astype(np.float32)
    
    # Normalize
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    return X, y, prices

def make_sequences(X: np.ndarray, y: np.ndarray, seq_len=SEQ_LEN):
    Xs, ys = [], []
    for i in range(len(X) - seq_len):
        Xs.append(X[i:i+seq_len])
        ys.append(y[i+seq_len])
    return np.array(Xs), np.array(ys)

def split_data(X, y, test_ratio=0.2):
    split = int(len(X) * (1 - test_ratio))
    return X[:split], X[split:], y[:split], y[split:]

def compute_metrics(y_true, y_pred) -> Dict[str, float]:
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    # Directional accuracy
    dir_acc = float(np.mean(np.sign(y_true) == np.sign(y_pred))) * 100
    return {
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "r2": round(r2, 4),
        "directional_accuracy": round(dir_acc, 2),
    }

# ──────────────────────────────────────────────────────────
# XGBoost
# ──────────────────────────────────────────────────────────
def run_xgboost(df: pd.DataFrame) -> Dict[str, Any]:
    try:
        from xgboost import XGBRegressor
    except ImportError:
        from sklearn.ensemble import GradientBoostingRegressor as XGBRegressor
    
    X, y, prices = prepare_features(df)
    X_train, X_test, y_train, y_test = split_data(X, y)
    
    model = XGBRegressor(n_estimators=200, learning_rate=0.05, max_depth=6,
                         subsample=0.8, colsample_bytree=0.8, random_state=42)
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    
    y_pred = model.predict(X_test)
    metrics = compute_metrics(y_test, y_pred)
    
    # Feature importance
    feature_imp = dict(zip(FEATURE_COLS, model.feature_importances_.tolist()))
    
    # Forecast next 7 days based on last known input
    last_X = X[-1:].copy()
    forecast = []
    last_price = float(prices[-1])
    for _ in range(7):
        ret = float(model.predict(last_X)[0])
        forecast.append(round(ret, 4))
    
    actual_series = [round(float(v), 2) for v in prices[-30:]]
    
    return {
        "model": "XGBoost",
        "metrics": metrics,
        "feature_importance": {k: round(v, 4) for k, v in sorted(feature_imp.items(), key=lambda x: -x[1])[:8]},
        "forecast_returns": forecast,
        "actual_prices": actual_series,
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

# ──────────────────────────────────────────────────────────
# LSTM
# ──────────────────────────────────────────────────────────
def run_lstm(df: pd.DataFrame) -> Dict[str, Any]:
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from tensorflow.keras.callbacks import EarlyStopping
    except ImportError:
        return {"error": "TensorFlow not installed. Run: pip install tensorflow"}

    X, y, prices = prepare_features(df)
    Xs, ys = make_sequences(X, y, SEQ_LEN)
    X_train, X_test, y_train, y_test = split_data(Xs, ys)

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, X.shape[1])),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    
    es = EarlyStopping(patience=5, restore_best_weights=True)
    history = model.fit(X_train, y_train, epochs=30, batch_size=32,
                        validation_data=(X_test, y_test), callbacks=[es], verbose=0)
    
    y_pred = model.predict(X_test, verbose=0).flatten()
    metrics = compute_metrics(y_test, y_pred)
    
    loss_curve = [round(v, 4) for v in history.history["loss"]]
    val_loss_curve = [round(v, 4) for v in history.history["val_loss"]]
    
    return {
        "model": "LSTM",
        "metrics": metrics,
        "loss_curve": loss_curve,
        "val_loss_curve": val_loss_curve,
        "epochs_trained": len(loss_curve),
        "actual_prices": [round(float(v), 2) for v in prices[-30:]],
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

# ──────────────────────────────────────────────────────────
# BiLSTM
# ──────────────────────────────────────────────────────────
def run_bilstm(df: pd.DataFrame) -> Dict[str, Any]:
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Bidirectional, LSTM, Dense, Dropout, BatchNormalization
        from tensorflow.keras.callbacks import EarlyStopping
    except ImportError:
        return {"error": "TensorFlow not installed. Run: pip install tensorflow"}

    X, y, prices = prepare_features(df)
    Xs, ys = make_sequences(X, y, SEQ_LEN)
    X_train, X_test, y_train, y_test = split_data(Xs, ys)

    model = Sequential([
        Bidirectional(LSTM(64, return_sequences=True), input_shape=(SEQ_LEN, X.shape[1])),
        BatchNormalization(),
        Dropout(0.3),
        Bidirectional(LSTM(32, return_sequences=False)),
        BatchNormalization(),
        Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    
    es = EarlyStopping(patience=5, restore_best_weights=True)
    history = model.fit(X_train, y_train, epochs=30, batch_size=32,
                        validation_data=(X_test, y_test), callbacks=[es], verbose=0)
    
    y_pred = model.predict(X_test, verbose=0).flatten()
    metrics = compute_metrics(y_test, y_pred)
    
    loss_curve = [round(v, 4) for v in history.history["loss"]]
    val_loss_curve = [round(v, 4) for v in history.history["val_loss"]]
    
    return {
        "model": "BiLSTM",
        "metrics": metrics,
        "loss_curve": loss_curve,
        "val_loss_curve": val_loss_curve,
        "epochs_trained": len(loss_curve),
        "actual_prices": [round(float(v), 2) for v in prices[-30:]],
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

# ──────────────────────────────────────────────────────────
# Deep Learning (Multi-layer Dense NN)
# ──────────────────────────────────────────────────────────
def run_deep_learning(df: pd.DataFrame) -> Dict[str, Any]:
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
        from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
    except ImportError:
        return {"error": "TensorFlow not installed. Run: pip install tensorflow"}

    X, y, prices = prepare_features(df)
    X_train, X_test, y_train, y_test = split_data(X, y)

    model = Sequential([
        Dense(256, activation="relu", input_shape=(X.shape[1],)),
        BatchNormalization(), Dropout(0.3),
        Dense(128, activation="relu"),
        BatchNormalization(), Dropout(0.3),
        Dense(64, activation="relu"),
        BatchNormalization(), Dropout(0.2),
        Dense(32, activation="relu"),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse")
    
    es = EarlyStopping(patience=8, restore_best_weights=True)
    rlr = ReduceLROnPlateau(patience=4, factor=0.5)
    history = model.fit(X_train, y_train, epochs=50, batch_size=64,
                        validation_data=(X_test, y_test), callbacks=[es, rlr], verbose=0)
    
    y_pred = model.predict(X_test, verbose=0).flatten()
    metrics = compute_metrics(y_test, y_pred)
    
    loss_curve = [round(v, 4) for v in history.history["loss"]]
    val_loss_curve = [round(v, 4) for v in history.history["val_loss"]]
    
    return {
        "model": "Deep Learning (MLP)",
        "metrics": metrics,
        "loss_curve": loss_curve,
        "val_loss_curve": val_loss_curve,
        "epochs_trained": len(loss_curve),
        "actual_prices": [round(float(v), 2) for v in prices[-30:]],
        "train_size": len(X_train),
        "test_size": len(X_test),
    }

# ──────────────────────────────────────────────────────────
# Hybrid Model (XGBoost + LSTM Ensemble)
# ──────────────────────────────────────────────────────────
def run_hybrid(df: pd.DataFrame) -> Dict[str, Any]:
    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout
        from tensorflow.keras.callbacks import EarlyStopping
    except ImportError:
        return {"error": "TensorFlow not installed. Run: pip install tensorflow"}

    try:
        from xgboost import XGBRegressor
    except ImportError:
        from sklearn.ensemble import GradientBoostingRegressor as XGBRegressor

    X, y, prices = prepare_features(df)
    Xs, ys = make_sequences(X, y, SEQ_LEN)
    
    # Align flat X with sequence targets
    X_flat = X[SEQ_LEN:]
    X_train_flat, X_test_flat, y_train, y_test = split_data(X_flat, ys)
    X_train_seq, X_test_seq, _, _ = split_data(Xs, ys)

    # Train XGBoost
    xgb = XGBRegressor(n_estimators=150, learning_rate=0.05, max_depth=5, random_state=42)
    xgb.fit(X_train_flat, y_train, eval_set=[(X_test_flat, y_test)], verbose=False)
    xgb_train_pred = xgb.predict(X_train_flat)
    xgb_test_pred = xgb.predict(X_test_flat)

    # Train LSTM
    lstm_model = Sequential([
        LSTM(32, return_sequences=False, input_shape=(SEQ_LEN, X.shape[1])),
        Dropout(0.2),
        Dense(16, activation="relu"),
        Dense(1)
    ])
    lstm_model.compile(optimizer="adam", loss="mse")
    es = EarlyStopping(patience=5, restore_best_weights=True)
    lstm_model.fit(X_train_seq, y_train, epochs=20, batch_size=32,
                   validation_data=(X_test_seq, y_test), callbacks=[es], verbose=0)
    lstm_train_pred = lstm_model.predict(X_train_seq, verbose=0).flatten()
    lstm_test_pred = lstm_model.predict(X_test_seq, verbose=0).flatten()

    # Ensemble (weighted average)
    alpha = 0.55  # XGBoost weight
    ensemble_train = alpha * xgb_train_pred + (1 - alpha) * lstm_train_pred
    ensemble_test = alpha * xgb_test_pred + (1 - alpha) * lstm_test_pred

    metrics = compute_metrics(y_test, ensemble_test)
    xgb_metrics = compute_metrics(y_test, xgb_test_pred)
    lstm_metrics = compute_metrics(y_test, lstm_test_pred)

    return {
        "model": "Hybrid (XGBoost + LSTM)",
        "metrics": metrics,
        "component_metrics": {
            "xgboost": xgb_metrics,
            "lstm": lstm_metrics,
            "ensemble_weight_xgb": alpha,
        },
        "actual_prices": [round(float(v), 2) for v in prices[-30:]],
        "train_size": len(X_train_flat),
        "test_size": len(X_test_flat),
    }


MODEL_RUNNERS = {
    "xgboost": run_xgboost,
    "lstm": run_lstm,
    "bilstm": run_bilstm,
    "deep_learning": run_deep_learning,
    "hybrid": run_hybrid,
}
