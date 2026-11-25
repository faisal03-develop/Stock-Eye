from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class StockPrediction(Base):
    __tablename__ = "stock_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), index=True)
    horizon: Mapped[str] = mapped_column(String(10), default="15D", index=True)  # 1D, 5D, 15D, 30D
    
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    p10_target: Mapped[float] = mapped_column(Float, nullable=False)
    p50_target: Mapped[float] = mapped_column(Float, nullable=False)
    p90_target: Mapped[float] = mapped_column(Float, nullable=False)
    
    expected_return_pct: Mapped[float] = mapped_column(Float, nullable=False)
    profit_probability: Mapped[float] = mapped_column(Float, default=0.5)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.7)
    verdict: Mapped[str] = mapped_column(String(50), default="BUY")
    
    # Serialized JSON representations
    top_drivers_json: Mapped[str] = mapped_column(Text, default="[]")
    sentiment_breakdown_json: Mapped[str] = mapped_column(Text, default='{"bullish": 70, "neutral": 20, "bearish": 10}')
    
    # Backtest verification fields
    actual_outcome_price: Mapped[float] = mapped_column(Float, nullable=True)
    is_target_hit: Mapped[bool] = mapped_column(Boolean, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    stock = relationship("Stock", back_populates="predictions")
