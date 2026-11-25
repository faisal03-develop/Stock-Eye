from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class NewsCatalyst(Base):
    __tablename__ = "news_catalysts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), nullable=True, index=True)
    
    headline: Mapped[str] = mapped_column(String(500), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    source_name: Mapped[str] = mapped_column(String(100), nullable=False)
    source_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # PUCARS, VERIFIED_NEWS, RUMOR
    
    credibility_weight: Mapped[float] = mapped_column(Float, default=1.0)  # 1.0, 0.8, 0.3
    raw_sentiment: Mapped[float] = mapped_column(Float, default=0.0)      # -1.0 to +1.0
    weighted_sentiment: Mapped[float] = mapped_column(Float, default=0.0) # raw * weight
    sentiment_type: Mapped[str] = mapped_column(String(20), default="NEUTRAL")  # BULLISH, BEARISH, NEUTRAL
    
    url: Mapped[str] = mapped_column(String(1000), default="")
    published_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    stock = relationship("Stock", back_populates="catalysts")
