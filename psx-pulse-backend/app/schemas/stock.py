from typing import Optional, List
from pydantic import BaseModel, Field


class StockCircuitLocks(BaseModel):
    upper: float = Field(..., description="Daily upper circuit breaker lock in PKR")
    lower: float = Field(..., description="Daily lower circuit breaker lock in PKR")


class StockSummary(BaseModel):
    symbol: str
    name: str
    sector: str
    is_kmi30: bool
    current_price: float
    change_amount: float
    change_percent: float
    daily_upper_lock: float
    daily_lower_lock: float
    volume: int
    market_cap_pkr: float
    pe_ratio: float
    rsi_14: float
    ai_conviction_score: Optional[int] = 75
    projected_return_pct: Optional[float] = 6.5
    is_watchlist: Optional[bool] = False


class StockScreenerResponse(BaseModel):
    total: int
    stocks: List[StockSummary]
    disclaimer: str
