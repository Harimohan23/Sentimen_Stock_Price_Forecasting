import os
import pandas as pd
import numpy as np
from typing import Optional

# Navigate: data_loader.py -> services -> app -> backend -> FinanceAI root
_THIS = os.path.abspath(__file__)
_SERVICES = os.path.dirname(_THIS)
_APP = os.path.dirname(_SERVICES)
_BACKEND = os.path.dirname(_APP)
_ROOT = os.path.dirname(_BACKEND)  # FinanceAI/

STOCK_CSV = os.path.join(_ROOT, "data", "processed", "stock_features.csv")
SENTIMENT_CSV = os.path.join(_ROOT, "data", "processed", "checkpoint.csv")


SECTOR_DISPLAY = {
    "IT": "Information Technology",
    "Banking": "Banking & Finance",
    "Pharma": "Pharmaceuticals",
    "Auto": "Automobile",
    "FMCG": "FMCG",
    "Energy": "Energy",
    "Metals": "Metals & Mining",
    "Infrastructure": "Infrastructure",
    "Telecom": "Telecom",
    "RealEstate": "Real Estate",
}

COMPANY_NAMES = {
    "HDFCBANK.NS": "HDFC Bank", "ICICIBANK.NS": "ICICI Bank", "SBIN.NS": "State Bank of India",
    "KOTAKBANK.NS": "Kotak Mahindra Bank", "AXISBANK.NS": "Axis Bank", "FEDERALBNK.NS": "Federal Bank",
    "IDFCFIRSTB.NS": "IDFC First Bank", "BANDHANBNK.NS": "Bandhan Bank", "PNB.NS": "Punjab National Bank",
    "CANBK.NS": "Canara Bank", "MUTHOOTFIN.NS": "Muthoot Finance", "CHOLAFIN.NS": "Cholamandalam Finance",
    "BAJFINANCE.NS": "Bajaj Finance", "RBLBANK.NS": "RBL Bank", "DCBBANK.NS": "DCB Bank",
    "KARURVYSYA.NS": "Karur Vysya Bank",
    "TCS.NS": "Tata Consultancy Services", "INFY.NS": "Infosys", "WIPRO.NS": "Wipro",
    "HCLTECH.NS": "HCL Technologies", "TECHM.NS": "Tech Mahindra", "MPHASIS.NS": "Mphasis",
    "COFORGE.NS": "Coforge", "PERSISTENT.NS": "Persistent Systems", "LTTS.NS": "L&T Technology Services",
    "TATAELXSI.NS": "Tata Elxsi", "KPITTECH.NS": "KPIT Technologies", "OFSS.NS": "Oracle Financial Services",
    "HAPPSTMNDS.NS": "Happiest Minds", "MASTEK.NS": "Mastek", "ROUTE.NS": "Route Mobile",
    "RELIANCE.NS": "Reliance Industries", "ONGC.NS": "ONGC", "NTPC.NS": "NTPC",
    "TATAPOWER.NS": "Tata Power", "POWERGRID.NS": "Power Grid Corporation", "BPCL.NS": "BPCL",
    "IOC.NS": "Indian Oil Corporation", "GAIL.NS": "GAIL India", "PETRONET.NS": "Petronet LNG",
    "IGL.NS": "Indraprastha Gas", "MGL.NS": "Mahanagar Gas", "GUJGASLTD.NS": "Gujarat Gas",
    "CESC.NS": "CESC Limited",
    "MARUTI.NS": "Maruti Suzuki", "BAJAJ-AUTO.NS": "Bajaj Auto", "HEROMOTOCO.NS": "Hero MotoCorp",
    "EICHERMOT.NS": "Eicher Motors", "ASHOKLEY.NS": "Ashok Leyland", "TATASTEEL.NS": "Tata Steel",
    "MOTHERSON.NS": "Motherson Sumi", "EXIDEIND.NS": "Exide Industries", "ENDURANCE.NS": "Endurance Technologies",
    "BOSCHLTD.NS": "Bosch Limited", "BALKRISIND.NS": "Balkrishna Industries", "SUPRAJIT.NS": "Suprajit Engineering",
    "SUNPHARMA.NS": "Sun Pharmaceutical", "DRREDDY.NS": "Dr. Reddy's Laboratories", "CIPLA.NS": "Cipla",
    "DIVISLAB.NS": "Divi's Laboratories", "AUROPHARMA.NS": "Aurobindo Pharma", "TORNTPHARM.NS": "Torrent Pharma",
    "ALKEM.NS": "Alkem Laboratories", "GLENMARK.NS": "Glenmark Pharmaceuticals", "IPCALAB.NS": "Ipca Laboratories",
    "ABBOTINDIA.NS": "Abbott India", "GRANULES.NS": "Granules India", "NATCOPHARM.NS": "Natco Pharma",
    "PFIZER.NS": "Pfizer India", "JBCHEPHARM.NS": "JB Chemicals",
    "HINDUNILVR.NS": "Hindustan Unilever", "ITC.NS": "ITC Limited", "NESTLEIND.NS": "Nestle India",
    "BRITANNIA.NS": "Britannia Industries", "DABUR.NS": "Dabur India", "MARICO.NS": "Marico",
    "GODREJCP.NS": "Godrej Consumer Products", "EMAMILTD.NS": "Emami Limited", "COLPAL.NS": "Colgate-Palmolive",
    "TATACONSUM.NS": "Tata Consumer Products", "VBL.NS": "Varun Beverages", "EIDPARRY.NS": "EID Parry",
    "VSTIND.NS": "VST Industries",
    "HINDALCO.NS": "Hindalco Industries", "JSWSTEEL.NS": "JSW Steel", "JINDALSTEL.NS": "Jindal Steel & Power",
    "SAIL.NS": "Steel Authority of India", "VEDL.NS": "Vedanta", "NMDC.NS": "NMDC",
    "NATIONALUM.NS": "National Aluminium", "RATNAMANI.NS": "Ratnamani Metals",
    "WELCORP.NS": "Welspun Corp", "APLAPOLLO.NS": "APL Apollo Tubes",
    "LT.NS": "Larsen & Toubro", "NCC.NS": "NCC Limited", "HGINFRA.NS": "H.G. Infra Engineering",
    "PNCINFRA.NS": "PNC Infratech", "ACC.NS": "ACC Cement", "AMBUJACEM.NS": "Ambuja Cements",
    "SHREECEM.NS": "Shree Cement", "ULTRACEMCO.NS": "UltraTech Cement",
    "BHARTIARTL.NS": "Bharti Airtel", "IDEA.NS": "Vodafone Idea", "TATACOMM.NS": "Tata Communications",
    "HFCL.NS": "HFCL Limited", "TEJASNET.NS": "Tejas Networks",
    "DLF.NS": "DLF Limited", "GODREJPROP.NS": "Godrej Properties", "OBEROIRLTY.NS": "Oberoi Realty",
    "PHOENIXLTD.NS": "Phoenix Mills", "PRESTIGE.NS": "Prestige Estates", "SOBHA.NS": "Sobha",
    "HOMEFIRST.NS": "Home First Finance", "AAVAS.NS": "Aavas Financiers",
    "ADANIPORTS.NS": "Adani Ports", "AEGISLOG.NS": "Aegis Logistics", "KPRMILL.NS": "KPR Mill",
}


class DataLoader:
    def __init__(self):
        self.stock_df: Optional[pd.DataFrame] = None
        self.sentiment_df: Optional[pd.DataFrame] = None
        self._loaded = False

    def load_all(self):
        stock_path = os.path.normpath(STOCK_CSV)
        sent_path = os.path.normpath(SENTIMENT_CSV)
        
        print(f"Loading stock data from: {stock_path}")
        self.stock_df = pd.read_csv(stock_path, parse_dates=["Date"])
        self.stock_df.sort_values(["Stock_Symbol", "Date"], inplace=True)
        self.stock_df.reset_index(drop=True, inplace=True)

        print(f"Loading sentiment data from: {sent_path}")
        self.sentiment_df = pd.read_csv(sent_path, parse_dates=["post_date_ist"])
        self._loaded = True
        print(f"✅ Loaded {len(self.stock_df)} stock rows, {len(self.sentiment_df)} sentiment rows")

    def get_stock_count(self):
        return self.stock_df["Stock_Symbol"].nunique() if self.stock_df is not None else 0

    def get_news_count(self):
        return len(self.sentiment_df) if self.sentiment_df is not None else 0

    def get_all_symbols(self):
        return sorted(self.stock_df["Stock_Symbol"].unique().tolist())

    def get_symbols_by_sector(self, sector: str):
        df = self.stock_df[self.stock_df["Sector"] == sector]
        return sorted(df["Stock_Symbol"].unique().tolist())

    def get_sectors(self):
        return sorted(self.stock_df["Sector"].unique().tolist())

    def get_stock_history(self, symbol: str, limit: int = None) -> pd.DataFrame:
        df = self.stock_df[self.stock_df["Stock_Symbol"] == symbol].copy()
        if limit:
            df = df.tail(limit)
        return df

    def get_latest_price_row(self, symbol: str) -> dict:
        df = self.get_stock_history(symbol)
        if df.empty:
            return {}
        row = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else row
        
        change = float(row["Close_Price"]) - float(prev["Close_Price"])
        change_pct = (change / float(prev["Close_Price"])) * 100 if float(prev["Close_Price"]) != 0 else 0.0
        
        return {
            "symbol": symbol,
            "name": COMPANY_NAMES.get(symbol, symbol.replace(".NS", "")),
            "sector": row["Sector"],
            "current_price": round(float(row["Close_Price"]), 2),
            "open": round(float(row["Open_Price"]), 2),
            "high": round(float(row["High_Price"]), 2),
            "low": round(float(row["Low_Price"]), 2),
            "volume": int(row["Volume"]),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "daily_return_pct": round(float(row.get("Daily_Return_Pct", change_pct)), 2),
            "sma_7": round(float(row["SMA_7"]), 2) if not pd.isna(row["SMA_7"]) else None,
            "sma_14": round(float(row["SMA_14"]), 2) if not pd.isna(row["SMA_14"]) else None,
            "sma_50": round(float(row["SMA_50"]), 2) if not pd.isna(row["SMA_50"]) else None,
            "rsi_14": round(float(row["RSI_14"]), 2) if not pd.isna(row["RSI_14"]) else None,
            "atr_14": round(float(row["ATR_14"]), 2) if not pd.isna(row["ATR_14"]) else None,
            "vwap_14": round(float(row["VWAP_14"]), 2) if not pd.isna(row["VWAP_14"]) else None,
            "week52_high": round(float(row["52W_High"]), 2),
            "week52_low": round(float(row["52W_Low"]), 2),
            "dist_from_52w_high": round(float(row["Dist_From_52W_High_Pct"]), 2) if not pd.isna(row["Dist_From_52W_High_Pct"]) else None,
            "volatility_20d": round(float(row["Volatility_20D"]), 2) if not pd.isna(row["Volatility_20D"]) else None,
            "market_cap": round(float(row["MarketCap_Proxy"]), 2) if not pd.isna(row["MarketCap_Proxy"]) else None,
            "date": str(row["Date"].date()),
        }

    def get_sentiment_for_symbol(self, symbol: str) -> dict:
        ticker_raw = symbol.replace(".NS", "")
        mask = self.sentiment_df["companies_mentioned"].str.contains(symbol, na=False, regex=False)
        df = self.sentiment_df[mask].copy()
        
        if df.empty:
            return {"symbol": symbol, "sentiment_score": 0.5, "positive_count": 0, "negative_count": 0, "neutral_count": 0, "recent_news": []}

        avg_score = float(df["sentiment_score"].mean())
        positive = int((df["sentiment_score"] >= 0.6).sum())
        negative = int((df["sentiment_score"] <= 0.4).sum())
        neutral = int(len(df) - positive - negative)

        recent = df.sort_values("post_date_ist", ascending=False).head(10)
        news = []
        for _, row in recent.iterrows():
            news.append({
                "headline": str(row["headline"])[:200],
                "date": str(row["post_date_ist"])[:10],
                "score": round(float(row["sentiment_score"]), 3),
                "sector": str(row["classified_sector"]),
                "event_type": str(row.get("event_type", "General")),
            })

        return {
            "symbol": symbol,
            "sentiment_score": round(avg_score, 3),
            "positive_count": positive,
            "negative_count": negative,
            "neutral_count": neutral,
            "total_news": len(df),
            "recent_news": news,
        }

    def get_top_movers(self, n=10, direction="gain"):
        latest_dates = self.stock_df.groupby("Stock_Symbol")["Date"].max().reset_index()
        latest_rows = []
        for _, r in latest_dates.iterrows():
            sym = r["Stock_Symbol"]
            dt = r["Date"]
            row = self.stock_df[(self.stock_df["Stock_Symbol"] == sym) & (self.stock_df["Date"] == dt)]
            if not row.empty:
                latest_rows.append(row.iloc[0])
        
        if not latest_rows:
            return []
        
        df = pd.DataFrame(latest_rows)
        df = df.dropna(subset=["Daily_Return_Pct"])
        
        if direction == "gain":
            df = df.nlargest(n, "Daily_Return_Pct")
        else:
            df = df.nsmallest(n, "Daily_Return_Pct")

        result = []
        for _, row in df.iterrows():
            sym = row["Stock_Symbol"]
            result.append({
                "symbol": sym,
                "name": COMPANY_NAMES.get(sym, sym.replace(".NS", "")),
                "sector": row["Sector"],
                "price": round(float(row["Close_Price"]), 2),
                "change_pct": round(float(row["Daily_Return_Pct"]), 2),
                "volume": int(row["Volume"]),
            })
        return result

    def get_most_active(self, n=10):
        latest_dates = self.stock_df.groupby("Stock_Symbol")["Date"].max().reset_index()
        latest_rows = []
        for _, r in latest_dates.iterrows():
            sym = r["Stock_Symbol"]
            dt = r["Date"]
            row = self.stock_df[(self.stock_df["Stock_Symbol"] == sym) & (self.stock_df["Date"] == dt)]
            if not row.empty:
                latest_rows.append(row.iloc[0])
        
        df = pd.DataFrame(latest_rows)
        df = df.nlargest(n, "Volume")
        
        result = []
        for _, row in df.iterrows():
            sym = row["Stock_Symbol"]
            result.append({
                "symbol": sym,
                "name": COMPANY_NAMES.get(sym, sym.replace(".NS", "")),
                "sector": row["Sector"],
                "price": round(float(row["Close_Price"]), 2),
                "change_pct": round(float(row.get("Daily_Return_Pct", 0.0)), 2),
                "volume": int(row["Volume"]),
            })
        return result

    def get_market_news(self, limit=20):
        df = self.sentiment_df.sort_values("post_date_ist", ascending=False).head(limit)
        return [
            {
                "headline": str(r["headline"])[:300],
                "date": str(r["post_date_ist"])[:10],
                "sector": str(r["classified_sector"]),
                "score": round(float(r["sentiment_score"]), 3),
                "event_type": str(r.get("event_type", "General")),
                "source": str(r.get("channel_key", "News")),
            }
            for _, r in df.iterrows()
        ]

    def get_sector_summary(self):
        sectors = {}
        for sector in self.get_sectors():
            symbols = self.get_symbols_by_sector(sector)
            sectors[sector] = {
                "sector": sector,
                "display_name": SECTOR_DISPLAY.get(sector, sector),
                "symbol_count": len(symbols),
                "symbols": symbols[:6],
            }
        return list(sectors.values())

    def get_stock_df_for_model(self, symbol: str) -> pd.DataFrame:
        return self.get_stock_history(symbol)


# Singleton
_loader = DataLoader()

def get_loader() -> DataLoader:
    return _loader
