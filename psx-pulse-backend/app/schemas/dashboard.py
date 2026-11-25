from typing import List, Optional
from pydantic import BaseModel
from app.schemas.stock import StockSummary


class MacroMetricItem(BaseModel):
    code: str
    name: str
    current_value: float
    change_amount: float
    change_percent: float
    formatted_value: str
    subtext: str


class TopProfitOpportunity(BaseModel):
    symbol: str
    name: str
    sector: str
    current_price: float
    target_price: float
    projected_return_pct: float
    confidence_pct: int
    is_kmi30: bool
    horizon: str


class DashboardPulseResponse(BaseModel):
    market_status: str
    kse100_summary: MacroMetricItem
    macro_indicators: List[MacroMetricItem]
    top_opportunities: List[TopProfitOpportunity]
    watchlist_stocks: List[StockSummary]
    disclaimer: str
