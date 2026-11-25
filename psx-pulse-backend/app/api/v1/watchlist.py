from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import get_db
from app.models.stock import Stock
from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistAddRequest, WatchlistResponse
from app.schemas.stock import StockSummary

router = APIRouter(prefix="/watchlist", tags=["Watchlist"])


@router.get("", response_model=WatchlistResponse)
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    """
    Returns all tracked PSX stocks in user's watchlist.
    """
    stmt = (
        select(Stock)
        .join(WatchlistItem, Stock.symbol == WatchlistItem.stock_symbol)
        .order_by(WatchlistItem.added_at.desc())
    )
    res = await db.execute(stmt)
    stocks = res.scalars().all()

    items = [
        StockSummary(
            symbol=s.symbol,
            name=s.name,
            sector=s.sector,
            is_kmi30=s.is_kmi30_shariah,
            current_price=s.current_price,
            change_amount=s.change_amount,
            change_percent=s.change_percent,
            daily_upper_lock=s.daily_upper_lock,
            daily_lower_lock=s.daily_lower_lock,
            volume=s.volume,
            market_cap_pkr=s.market_cap_pkr,
            pe_ratio=s.pe_ratio,
            rsi_14=s.rsi_14,
            ai_conviction_score=82 if s.is_kmi30_shariah else 75,
            projected_return_pct=7.2,
            is_watchlist=True
        )
        for s in stocks
    ]

    return WatchlistResponse(
        items=items,
        total=len(items),
        message="Watchlist retrieved successfully"
    )


@router.post("", response_model=WatchlistResponse, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(payload: WatchlistAddRequest, db: AsyncSession = Depends(get_db)):
    """
    Adds a PSX symbol to the watchlist.
    """
    sym = payload.symbol.upper()
    stock_res = await db.execute(select(Stock).where(Stock.symbol == sym))
    stock = stock_res.scalar_one_or_none()
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock {sym} not found in PSX universe")

    # Check if already in watchlist
    wl_res = await db.execute(select(WatchlistItem).where(WatchlistItem.stock_symbol == sym))
    existing = wl_res.scalar_one_or_none()
    if not existing:
        new_item = WatchlistItem(stock_symbol=sym)
        db.add(new_item)
        await db.commit()

    return await get_watchlist(db)


@router.delete("/{symbol}", response_model=WatchlistResponse)
async def remove_from_watchlist(symbol: str, db: AsyncSession = Depends(get_db)):
    """
    Removes a symbol from the watchlist.
    """
    sym = symbol.upper()
    stmt = delete(WatchlistItem).where(WatchlistItem.stock_symbol == sym)
    await db.execute(stmt)
    await db.commit()

    return await get_watchlist(db)
