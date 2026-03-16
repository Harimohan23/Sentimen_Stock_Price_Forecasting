from fastapi import APIRouter, HTTPException
from app.services.data_loader import get_loader
from app.services.model_service import MODEL_RUNNERS
import time

router = APIRouter()

@router.get("/models")
def list_models():
    return [
        {"id": "xgboost", "name": "XGBoost", "description": "Gradient boosted trees — fast, high accuracy on tabular data", "type": "Tree-based"},
        {"id": "lstm", "name": "LSTM", "description": "Long Short-Term Memory — captures temporal patterns in price sequences", "type": "Deep Learning"},
        {"id": "bilstm", "name": "BiLSTM", "description": "Bidirectional LSTM — reads sequences forward & backward for richer context", "type": "Deep Learning"},
        {"id": "deep_learning", "name": "Deep Learning (MLP)", "description": "Multi-layer perceptron — powerful non-linear feature learning", "type": "Neural Network"},
        {"id": "hybrid", "name": "Hybrid (XGB + LSTM)", "description": "Ensemble of XGBoost and LSTM — combines tree and sequential strengths", "type": "Ensemble"},
    ]

@router.get("/{symbol}")
def predict(symbol: str, model: str = "xgboost"):
    loader = get_loader()
    df = loader.get_stock_df_for_model(symbol)
    
    if df is None or df.empty:
        raise HTTPException(404, f"No data found for {symbol}")
    
    if len(df) < 60:
        raise HTTPException(400, f"Not enough data for {symbol} (need 60+ rows)")
    
    model_key = model.lower().replace("-", "_")
    runner = MODEL_RUNNERS.get(model_key)
    
    if not runner:
        raise HTTPException(400, f"Unknown model: {model}. Available: {list(MODEL_RUNNERS.keys())}")
    
    start = time.time()
    result = runner(df)
    elapsed = round(time.time() - start, 2)
    
    if "error" in result:
        raise HTTPException(500, result["error"])
    
    # Add metadata
    from app.services.data_loader import COMPANY_NAMES
    result["symbol"] = symbol
    result["company_name"] = COMPANY_NAMES.get(symbol, symbol)
    result["training_time_seconds"] = elapsed
    result["data_rows_used"] = len(df)
    
    # Current price info
    row = loader.get_latest_price_row(symbol)
    result["current_price"] = row.get("current_price", None)
    result["last_date"] = row.get("date", None)
    
    return result
