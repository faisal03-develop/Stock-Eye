from datetime import datetime
from sqlalchemy import String, Float, Boolean, BigInteger, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Stock(Base):
    __tablename__ = "stocks"

    symbol: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sector: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    is_kmi30_shariah: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    
    current_price: Mapped[float] = mapped_column(Float, nullable=False)
    change_amount: Mapped[float] = mapped_column(Float, default=0.0)
    change_percent: Mapped[float] = mapped_column(Float, default=0.0)
    
    # PSX Daily Circuit Breakers
    daily_upper_lock: Mapped[float] = mapped_column(Float, nullable=False)
    daily_lower_lock: Mapped[float] = mapped_column(Float, nullable=False)
    
    volume: Mapped[int] = mapped_column(BigInteger, default=0)
    market_cap_pkr: Mapped[float] = mapped_column(Float, default=0.0)
    pe_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    rsi_14: Mapped[float] = mapped_column(Float, default=50.0)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ohlcv_records = relationship("HistoricalOHLCV", back_populates="stock", cascade="all, delete-orphan")
    predictions = relationship("StockPrediction", back_populates="stock", cascade="all, delete-orphan")
    catalysts = relationship("NewsCatalyst", back_populates="stock", cascade="all, delete-orphan")
