from fastapi import APIRouter
from app.services.data_loader import get_loader

router = APIRouter()

@router.get("/{symbol}")
def get_sentiment(symbol: str):
    return get_loader().get_sentiment_for_symbol(symbol)

@router.get("/sector/{sector_name}")
def sector_sentiment(sector_name: str):
    loader = get_loader()
    df = loader.sentiment_df
    sec_df = df[df["classified_sector"].str.lower() == sector_name.lower()]
    if sec_df.empty:
        return {"sector": sector_name, "avg_score": 0.5, "count": 0}
    avg = float(sec_df["sentiment_score"].mean())
    return {
        "sector": sector_name,
        "avg_score": round(avg, 3),
        "count": len(sec_df),
        "positive_count": int((sec_df["sentiment_score"] >= 0.6).sum()),
        "negative_count": int((sec_df["sentiment_score"] <= 0.4).sum()),
    }
