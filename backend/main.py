from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.services.data_loader import get_loader          # ← import get_loader, NOT DataLoader
from app.api.routes import market_routes, company_routes, chart_routes, sentiment_routes, model_routes

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Loading data files...")
    get_loader().load_all()                              # ← loads the SINGLETON all routes use
    print("✅ Data loaded successfully")
    yield
    print("Shutting down...")

app = FastAPI(
    title="FinanceAI API",
    description="Indian Stock Market Analytics with ML Predictions",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market_routes.router,    prefix="/api/market",     tags=["Market"])
app.include_router(company_routes.router,   prefix="/api/company",    tags=["Company"])
app.include_router(chart_routes.router,     prefix="/api/chart-data", tags=["Charts"])
app.include_router(sentiment_routes.router, prefix="/api/sentiment",  tags=["Sentiment"])
app.include_router(model_routes.router,     prefix="/api/predict",    tags=["Predictions"])

@app.get("/")
def root():
    return {"message": "FinanceAI API v2.0 - Running", "docs": "/api/docs"}

@app.get("/api/health")
def health():
    loader = get_loader()
    return {
        "status": "healthy",
        "stocks_loaded": loader.get_stock_count(),
        "news_loaded": loader.get_news_count()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)