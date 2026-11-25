from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    stock_symbol: Mapped[str] = mapped_column(String(20), ForeignKey("stocks.symbol", ondelete="CASCADE"), unique=True, index=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    stock = relationship("Stock")
