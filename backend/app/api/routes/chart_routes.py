from fastapi import APIRouter, HTTPException
from app.services.data_loader import get_loader

router = APIRouter()

PERIOD_DAYS = {
    "1m": 22, "3m": 66, "6m": 132, "1y": 252, "3y": 756, "5y": 1260,
}

@router.get("/{symbol}")
def get_chart(symbol: str, period: str = "1y"):
    loader = get_loader()
    days = PERIOD_DAYS.get(period, 252)
    df = loader.get_stock_history(symbol, limit=days)
    
    if df.empty:
        raise HTTPException(404, f"No data for {symbol}")
    
    result = []
    for _, row in df.iterrows():
        result.append({
            "date": str(row["Date"].date()),
            "open": round(float(row["Open_Price"]), 2),
            "high": round(float(row["High_Price"]), 2),
            "low": round(float(row["Low_Price"]), 2),
            "close": round(float(row["Close_Price"]), 2),
            "volume": int(row["Volume"]),
            "sma_7": round(float(row["SMA_7"]), 2) if not __import__("pandas").isna(row["SMA_7"]) else None,
            "sma_14": round(float(row["SMA_14"]), 2) if not __import__("pandas").isna(row["SMA_14"]) else None,
            "sma_50": round(float(row["SMA_50"]), 2) if not __import__("pandas").isna(row["SMA_50"]) else None,
            "rsi": round(float(row["RSI_14"]), 2) if not __import__("pandas").isna(row["RSI_14"]) else None,
        })
    return result
