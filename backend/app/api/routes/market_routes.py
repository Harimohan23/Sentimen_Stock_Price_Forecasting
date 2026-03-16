from fastapi import APIRouter
from app.services.data_loader import get_loader

router = APIRouter()

@router.get("/top-gainers")
def top_gainers(n: int = 10):
    return get_loader().get_top_movers(n, "gain")

@router.get("/top-losers")
def top_losers(n: int = 10):
    return get_loader().get_top_movers(n, "loss")

@router.get("/most-active")
def most_active(n: int = 10):
    return get_loader().get_most_active(n)

@router.get("/news")
def market_news(limit: int = 20):
    return get_loader().get_market_news(limit)

@router.get("/sectors")
def sectors():
    return get_loader().get_sector_summary()

@router.get("/sector/{sector_name}")
def sector_stocks(sector_name: str):
    loader = get_loader()
    symbols = loader.get_symbols_by_sector(sector_name)
    result = []
    for sym in symbols:
        row = loader.get_latest_price_row(sym)
        if row:
            result.append(row)
    result.sort(key=lambda x: abs(x.get("change_pct", 0)), reverse=True)
    return result

@router.get("/search")
def search_stocks(query: str = ""):
    if not query:
        return []
    loader = get_loader()
    query_lower = query.lower()
    all_symbols = loader.get_all_symbols()
    from app.services.data_loader import COMPANY_NAMES
    matches = []
    for sym in all_symbols:
        name = COMPANY_NAMES.get(sym, sym)
        if query_lower in sym.lower() or query_lower in name.lower():
            row = loader.get_latest_price_row(sym)
            if row:
                matches.append(row)
    return matches[:10]

@router.get("/overview")
def market_overview():
    loader = get_loader()
    gainers = loader.get_top_movers(5, "gain")
    losers = loader.get_top_movers(5, "loss")
    active = loader.get_most_active(5)
    news = loader.get_market_news(5)
    sectors = loader.get_sector_summary()
    return {
        "top_gainers": gainers,
        "top_losers": losers,
        "most_active": active,
        "latest_news": news,
        "sectors": sectors,
    }
