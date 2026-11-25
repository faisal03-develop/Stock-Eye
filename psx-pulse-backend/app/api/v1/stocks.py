from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.stock import Stock
from app.models.market_data import HistoricalOHLCV
from app.models.catalyst import NewsCatalyst
from app.models.watchlist import WatchlistItem
from app.schemas.stock import StockSummary, StockScreenerResponse, StockCircuitLocks
from app.schemas.forecast import (
    StockForecastResponse,
    CandlePoint,
    ForecastPoint,
    ForecastVerdict,
    SentimentBreakdown,
    ExplainabilityDriver
)
from app.services.psx_ingestion import calculate_psx_circuit_locks, PSXDataIngestionService
from app.services.feature_engine import FeatureEngineService
from app.services.nlp_sentiment import NLPSentimentService
from app.services.ml_forecaster import MLForecasterService

router = APIRouter(prefix="/stocks", tags=["Stocks & Screener"])


@router.get("", response_model=StockScreenerResponse)
async def list_stocks_screener(
    sector: Optional[str] = Query(None, description="Filter by sector (e.g. Technology, Commercial Banks)"),
    is_kmi30: Optional[bool] = Query(None, description="Filter for KMI-30 Islamic Compliant stocks only"),
    search: Optional[str] = Query(None, description="Search ticker symbol or company name"),
    sort_by: str = Query("prob", description="prob | return | rsi | volume | price"),
    db: AsyncSession = Depends(get_db)
):
    """
    PSX Stock Screener & Ticker Search endpoint.
    Returns ranked stocks with live prices, PSX circuit locks, and AI conviction scores.
    """
    stmt = select(Stock)

    if sector and sector.upper() != "ALL":
        stmt = stmt.where(Stock.sector.ilike(f"%{sector}%"))

    if is_kmi30 is True:
        stmt = stmt.where(Stock.is_kmi30_shariah == True)

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            (Stock.symbol.ilike(search_pattern)) | (Stock.name.ilike(search_pattern))
        )

    res = await db.execute(stmt)
    records = res.scalars().all()

    # Fetch watchlist items to flag is_watchlist
    wl_res = await db.execute(select(WatchlistItem.stock_symbol))
    wl_symbols = set(wl_res.scalars().all())

    summaries = []
    for s in records:
        # Dynamic conviction calculation based on momentum & Shariah
        conviction = 82 if s.is_kmi30_shariah else 74
        if s.change_percent >= 1.0:
            conviction += 6
        projected = round(max(3.5, 6.0 + (s.change_percent * 0.8)), 1)

        summaries.append(
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
                ai_conviction_score=conviction,
                projected_return_pct=projected,
                is_watchlist=(s.symbol in wl_symbols)
            )
        )

    # In-memory sorting based on requested parameter
    if sort_by == "prob":
        summaries.sort(key=lambda x: x.ai_conviction_score or 0, reverse=True)
    elif sort_by == "return":
        summaries.sort(key=lambda x: x.projected_return_pct or 0.0, reverse=True)
    elif sort_by == "rsi":
        summaries.sort(key=lambda x: x.rsi_14, reverse=True)
    elif sort_by == "volume":
        summaries.sort(key=lambda x: x.volume, reverse=True)
    elif sort_by == "price":
        summaries.sort(key=lambda x: x.current_price, reverse=True)

    return StockScreenerResponse(
        total=len(summaries),
        stocks=summaries,
        disclaimer=settings.EDUCATIONAL_DISCLAIMER
    )


@router.get("/{symbol}/forecast", response_model=StockForecastResponse)
async def get_stock_forecast(
    symbol: str,
    horizon: str = Query("15D", description="Horizon: 1D | 5D | 15D | 30D"),
    db: AsyncSession = Depends(get_db)
):
    """
    Core Stock AI Prediction endpoint.
    Returns:
    - 30-day historical candles
    - NOW divider
    - Probabilistic forecast cone (p10, p50, p90) clamped to PSX circuit breaker bounds
    - SHAP explainability drivers & sentiment breakdown
    """
    sym = symbol.upper()
    stock_stmt = select(Stock).where(Stock.symbol == sym)
    stock_res = await db.execute(stock_stmt)
    stock = stock_res.scalar_one_or_none()

    if not stock:
        # Create on-the-fly or return 404
        raise HTTPException(status_code=404, detail=f"Stock with symbol '{sym}' not found in PSX universe")

    # 1. Fetch Historical OHLCV
    candle_stmt = (
        select(HistoricalOHLCV)
        .where(HistoricalOHLCV.stock_symbol == sym)
        .order_by(HistoricalOHLCV.trading_date.asc())
        .limit(30)
    )
    candle_res = await db.execute(candle_stmt)
    db_candles = candle_res.scalars().all()

    if db_candles:
        candles = [
            {
                "date": c.trading_date.isoformat(),
                "open": c.open,
                "high": c.high,
                "low": c.low,
                "close": c.close,
                "volume": c.volume
            }
            for c in db_candles
        ]
    else:
        # Fallback to generated synthetic candles if not seeded yet
        candles = PSXDataIngestionService.generate_synthetic_historical_candles(sym, stock.current_price, days=30)

    # 2. Extract technical features & volume z-score
    features = FeatureEngineService.extract_feature_vector(candles)

    # 3. Fetch recent catalysts for this stock
    cat_stmt = select(NewsCatalyst).where(NewsCatalyst.stock_symbol == sym)
    cat_res = await db.execute(cat_stmt)
    catalysts = cat_res.scalars().all()
    cat_dicts = [
        {"sentiment_type": c.sentiment_type, "weighted_sentiment": c.weighted_sentiment}
        for c in catalysts
    ]

    sentiment_breakdown_dict = NLPSentimentService.aggregate_sentiment_breakdown(cat_dicts)
    avg_sentiment = sum(c["weighted_sentiment"] for c in cat_dicts) / max(1, len(cat_dicts)) if cat_dicts else 0.45

    # 4. Generate Quantile Regression Forecast Cone
    forecast_result = MLForecasterService.generate_forecast_cone(
        symbol=sym,
        current_price=stock.current_price,
        features=features,
        sentiment_score=avg_sentiment,
        horizon=horizon
    )

    # 5. Circuit locks
    upper_lock, lower_lock = calculate_psx_circuit_locks(stock.current_price)

    return StockForecastResponse(
        symbol=stock.symbol,
        name=stock.name,
        is_kmi30=stock.is_kmi30_shariah,
        current_price=stock.current_price,
        daily_change_pct=stock.change_percent,
        locks=StockCircuitLocks(upper=upper_lock, lower=lower_lock),
        historical_candles=[CandlePoint(**c) for c in candles],
        forecast_cone=[ForecastPoint(**p) for p in forecast_result["forecast_cone"]],
        verdict=ForecastVerdict(**forecast_result["verdict"]),
        sentiment_breakdown=SentimentBreakdown(**sentiment_breakdown_dict),
        explainability_drivers=[ExplainabilityDriver(**d) for d in forecast_result["explainability_drivers"]],
        disclaimer=settings.EDUCATIONAL_DISCLAIMER
    )
