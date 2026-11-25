from typing import List
from pydantic import BaseModel


class ClosedPredictionLogItem(BaseModel):
    id: int
    ticker: str
    horizon: str
    predicted_return: str
    actual_return: str
    is_hit: bool
    status: str
    time_ago: str


class SectorAccuracyItem(BaseModel):
    sector: str
    hit_rate_pct: float


class ModelAccuracyResponse(BaseModel):
    hit_rate_90d: float
    total_predictions: int
    avg_win_return_pct: float
    cumulative_model_return: float
    kse100_benchmark_return: float
    sector_breakdown: List[SectorAccuracyItem]
    recent_closed_log: List[ClosedPredictionLogItem]
    disclaimer: str
