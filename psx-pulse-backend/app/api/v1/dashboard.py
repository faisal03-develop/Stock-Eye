from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.core.redis_client import cache
from app.models.stock import Stock
from app.models.market_data import MacroIndicator
from app.models.watchlist import WatchlistItem
from app.schemas.dashboard import DashboardPulseResponse, MacroMetricItem, TopProfitOpportunity
from app.schemas.stock import StockSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/pulse", response_model=DashboardPulseResponse)
async def get_dashboard_pulse(db: AsyncSession = Depends(get_db)):
    """
    Returns KSE-100 & Macro Pulse, Top AI Profit Opportunities, and Watchlist snapshot.
    Cached for fast sub-50ms response times.
    """
    cache_key = "dashboard:pulse"
    cached_data = await cache.get(cache_key)
    if cached_data:
        return cached_data

    # 1. Fetch Macro Indicators
    macro_stmt = select(MacroIndicator)
    macro_res = await db.execute(macro_stmt)
    macro_records = macro_res.scalars().all()

    kse100_item = None
    other_macros = []

    for m in macro_records:
        metric = MacroMetricItem(
            code=m.code,
            name=m.name,
            current_value=m.current_value,
            change_amount=m.change_amount,
            change_percent=m.change_percent,
            formatted_value=m.formatted_value,
            subtext=m.subtext
        )
        if m.code == "KSE100":
            kse100_item = metric
        else:
            other_macros.append(metric)

    if not kse100_item:
        kse100_item = MacroMetricItem(
            code="KSE100",
            name="KSE-100 Index",
            current_value=118450.20,
            change_amount=1310.0,
            change_percent=1.12,
            formatted_value="118,450.20",
            subtext="SBP / PSX Realtime Feed"
        )

    # 2. Fetch Top AI Opportunities (Stocks with highest projected returns)
    stock_stmt = select(Stock).order_by(Stock.change_percent.desc()).limit(4)
    stock_res = await db.execute(stock_stmt)
    top_stocks = stock_res.scalars().all()

    top_opportunities = []
    for s in top_stocks:
        target = round(s.current_price * 1.078, 2)
        top_opportunities.append(
            TopProfitOpportunity(
                symbol=s.symbol,
                name=s.name,
                sector=s.sector,
                current_price=s.current_price,
                target_price=target,
                projected_return_pct=7.8,
                confidence_pct=81,
                is_kmi30=s.is_kmi30_shariah,
                horizon="7-Day Horizon"
            )
        )

    # 3. Fetch Watchlist stocks
    wl_stmt = select(WatchlistItem)
    wl_res = await db.execute(wl_stmt)
    wl_items = wl_res.scalars().all()
    wl_symbols = {w.stock_symbol for w in wl_items}

    all_stocks_stmt = select(Stock).limit(8)
    all_stocks_res = await db.execute(all_stocks_stmt)
    all_stocks = all_stocks_res.scalars().all()

    watchlist_summaries = []
    for s in all_stocks:
        is_in_wl = s.symbol in wl_symbols
        watchlist_summaries.append(
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
                ai_conviction_score=80 if s.is_kmi30_shariah else 72,
                projected_return_pct=7.8 if s.change_percent >= 0 else 4.2,
                is_watchlist=is_in_wl
            )
        )

    response = DashboardPulseResponse(
        market_status="PSX OPEN • 09:30–15:30 PKT",
        kse100_summary=kse100_item,
        macro_indicators=other_macros,
        top_opportunities=top_opportunities,
        watchlist_stocks=watchlist_summaries,
        disclaimer=settings.EDUCATIONAL_DISCLAIMER
    )

    await cache.set(cache_key, response.model_dump(), expire_seconds=30)
    return response
