from typing import List
from pydantic import BaseModel
from app.schemas.stock import StockSummary


class WatchlistAddRequest(BaseModel):
    symbol: str


class WatchlistResponse(BaseModel):
    items: List[StockSummary]
    total: int
    message: str
