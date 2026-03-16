# 🚀 FinanceAI — Indian Market Intelligence Platform

AI-powered stock analytics with 5 years of NSE data, multi-model price prediction, and real-time sentiment analysis.

---

## 📦 Project Structure

```
FinanceAI/
├── data/
│   └── processed/
│       ├── stock_features.csv     ← 118 NSE stocks, 5 years OHLCV + indicators
│       └── checkpoint.csv         ← 57K+ Telegram financial news + sentiment
├── backend/                       ← FastAPI Python backend
│   ├── app/
│   │   ├── services/
│   │   │   ├── data_loader.py     ← CSV data management
│   │   │   └── model_service.py   ← XGBoost, LSTM, BiLSTM, DL, Hybrid
│   │   └── api/routes/            ← API endpoints
│   ├── main.py
│   └── requirements.txt
├── frontend/                      ← React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── MarketPage.jsx
│       │   ├── CompanyPage.jsx
│       │   ├── SectorPage.jsx
│       │   └── PredictPage.jsx    ← AI model prediction
│       └── services/api.js
├── start.sh                       ← Linux/Mac startup
└── start_windows.bat              ← Windows startup
```

---

## ⚡ Quick Start

### Step 1: Install Backend

```bash
cd backend
pip install -r requirements.txt
```

> For TensorFlow (LSTM/BiLSTM/DL/Hybrid models):
> ```bash
> pip install tensorflow
> ```

### Step 2: Install Frontend

```bash
cd frontend
npm install
```

### Step 3: Run

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```
Double-click start_windows.bat
```

**Manual (two terminals):**
```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && npm run dev
```

### Step 4: Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5175 |
| API Docs | http://localhost:8000/api/docs |
| Swagger UI | http://localhost:8000/api/redoc |

---

## 🤖 AI Models Available

| Model | Type | Best For | Speed |
|-------|------|----------|-------|
| **XGBoost** | Tree-based | Tabular features, interpretability | ⚡⚡⚡ Fast |
| **LSTM** | Deep Learning | Sequential price patterns | ⚡⚡ Medium |
| **BiLSTM** | Deep Learning | Rich temporal context | ⚡ Slower |
| **Deep Learning (MLP)** | Neural Network | Non-linear feature interactions | ⚡⚡ Medium |
| **Hybrid (XGB + LSTM)** | Ensemble | Best accuracy via combination | ⚡ Slowest |

### Features Used in Training
- OHLCV (Open, High, Low, Close, Volume)
- SMA 7, SMA 14, SMA 50
- ATR 14, RSI 14, VWAP 14
- 52-Week High distance
- 20-day Volatility
- Earnings Flag

---

## 📊 API Endpoints

### Market
```
GET /api/market/overview          — Dashboard data
GET /api/market/top-gainers       — Top gaining stocks
GET /api/market/top-losers        — Top losing stocks
GET /api/market/most-active       — Highest volume stocks
GET /api/market/sectors           — All sectors
GET /api/market/sector/{name}     — Stocks in sector
GET /api/market/search?query=TCS  — Search stocks
GET /api/market/news              — Latest news
```

### Company
```
GET /api/company/{symbol}         — Full company info + sentiment
GET /api/company/sector/{symbol}  — Peer companies
```

### Charts
```
GET /api/chart-data/{symbol}?period=1y   — Historical OHLCV
```
Periods: `1m`, `3m`, `6m`, `1y`, `3y`, `5y`

### Prediction
```
GET /api/predict/models                        — List available models
GET /api/predict/{symbol}?model=xgboost        — Run prediction
GET /api/predict/{symbol}?model=lstm
GET /api/predict/{symbol}?model=bilstm
GET /api/predict/{symbol}?model=deep_learning
GET /api/predict/{symbol}?model=hybrid
```

---

## 📈 Available Stocks (118 symbols)

### IT
TCS, INFY, WIPRO, HCLTECH, TECHM, MPHASIS, COFORGE, PERSISTENT, LTTS, TATAELXSI...

### Banking
HDFCBANK, ICICIBANK, SBIN, KOTAKBANK, AXISBANK, BAJFINANCE, FEDERALBNK...

### Pharma  
SUNPHARMA, DRREDDY, CIPLA, DIVISLAB, AUROPHARMA, TORNTPHARM, ALKEM...

### Auto
MARUTI, BAJAJ-AUTO, HEROMOTOCO, EICHERMOT, ASHOKLEY, TATASTEEL...

### Energy
RELIANCE, ONGC, NTPC, TATAPOWER, POWERGRID, BPCL, IOC, GAIL...

---

## 🛠️ Troubleshooting

**Backend won't start:**
```bash
pip install fastapi uvicorn pandas numpy scikit-learn xgboost
```

**Frontend build errors:**
```bash
cd frontend && npm install && npm run dev
```

**Model predictions slow (LSTM/BiLSTM):**
This is normal — deep learning models train from scratch each time. XGBoost is fastest.

**TensorFlow not found:**
```bash
pip install tensorflow
# or for CPU-only:
pip install tensorflow-cpu
```

---

## 🎓 Tech Stack

- **Frontend**: React 18, Vite, Recharts, React Router
- **Backend**: FastAPI, Python 3.10+, Uvicorn
- **ML**: XGBoost, TensorFlow/Keras (LSTM, BiLSTM, MLP)
- **Data**: Pandas, NumPy, Scikit-learn
- **Design**: Custom CSS, JetBrains Mono, Syne, Outfit
