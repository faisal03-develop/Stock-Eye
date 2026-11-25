from typing import List
from pydantic import BaseModel, Field
from app.schemas.stock import StockCircuitLocks


class CandlePoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class ForecastPoint(BaseModel):
    date: str
    p10: float = Field(..., description="10th percentile - Bearish boundary")
    p50: float = Field(..., description="50th percentile - Median target")
    p90: float = Field(..., description="90th percentile - Bullish boundary")


class ForecastVerdict(BaseModel):
    direction: str = Field(..., description="BULLISH, BEARISH, or NEUTRAL")
    profit_probability: float = Field(..., description="Probability of positive return 0.0 - 1.0")
    confidence_score: float = Field(..., description="Model calibration confidence 0.0 - 1.0")
    expected_return_pct: float = Field(..., description="Projected percentage gain to p50")


class SentimentBreakdown(BaseModel):
    bullish: int = Field(..., description="Percentage bullish sentiment (0-100)")
    neutral: int = Field(..., description="Percentage neutral sentiment (0-100)")
    bearish: int = Field(..., description="Percentage bearish sentiment (0-100)")


class ExplainabilityDriver(BaseModel):
    impact_pct: int = Field(..., description="Relative feature contribution percentage")
    feature: str = Field(..., description="Description of the feature driver")


class StockForecastResponse(BaseModel):
    symbol: str
    name: str
    is_kmi30: bool
    current_price: float
    daily_change_pct: float
    locks: StockCircuitLocks
    historical_candles: List[CandlePoint]
    forecast_cone: List[ForecastPoint]
    verdict: ForecastVerdict
    sentiment_breakdown: SentimentBreakdown
    explainability_drivers: List[ExplainabilityDriver]
    disclaimer: str
