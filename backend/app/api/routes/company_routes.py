from fastapi import APIRouter, HTTPException
from app.services.data_loader import get_loader

router = APIRouter()

@router.get("/{symbol}")
def get_company(symbol: str):
    loader = get_loader()
    row = loader.get_latest_price_row(symbol)
    if not row:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    sentiment = loader.get_sentiment_for_symbol(symbol)
    row["sentiment"] = sentiment
    return row

@router.get("/validate/{symbol}")
def validate_symbol(symbol: str):
    loader = get_loader()
    exists = symbol in loader.get_all_symbols()
    return {"symbol": symbol, "valid": exists}

@router.get("/sector/{symbol}")
def get_company_sector_peers(symbol: str, n: int = 6):
    loader = get_loader()
    row = loader.get_latest_price_row(symbol)
    if not row:
        raise HTTPException(404, "Symbol not found")
    sector = row["sector"]
    peers = [s for s in loader.get_symbols_by_sector(sector) if s != symbol][:n]
    from app.services.data_loader import COMPANY_NAMES
    result = []
    for p in peers:
        pr = loader.get_latest_price_row(p)
        if pr:
            result.append(pr)
    return result
