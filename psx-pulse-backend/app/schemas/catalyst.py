from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class NewsCatalystItem(BaseModel):
    id: int
    stock_symbol: Optional[str] = None
    headline: str
    summary: str
    source_name: str
    source_type: str = Field(..., description="PUCARS, VERIFIED_NEWS, or RUMOR")
    credibility_weight: float = Field(..., description="1.0 for PUCARS, 0.8 for Press, 0.3 for Rumors")
    raw_sentiment: float
    weighted_sentiment: float
    sentiment_type: str = Field(..., description="BULLISH, BEARISH, or NEUTRAL")
    url: str
    published_at: datetime
    time_ago: Optional[str] = None


class CatalystsResponse(BaseModel):
    total: int
    verified_count: int
    rumor_count: int
    catalysts: List[NewsCatalystItem]
    disclaimer: str
