import asyncio
import logging
from datetime import datetime, date, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.stock import Stock
from app.models.market_data import HistoricalOHLCV, MacroIndicator
from app.models.catalyst import NewsCatalyst
from app.models.prediction import StockPrediction
from app.models.watchlist import WatchlistItem
from app.services.psx_ingestion import (
    calculate_psx_circuit_locks,
    PSXDataIngestionService
)
from app.services.news_scraper import TwoTierNewsScraperService
from app.services.nlp_sentiment import NLPSentimentService
from app.services.feature_engine import FeatureEngineService
from app.services.ml_forecaster import MLForecasterService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")


async def seed():
    logger.info("Initializing PSX Pulse AI database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed PSX Stocks
        logger.info("Seeding PSX equity universe...")
        symbols_data = PSXDataIngestionService.get_supported_symbols()
        
        for item in symbols_data:
            sym = item["symbol"]
            existing = await session.execute(select(Stock).where(Stock.symbol == sym))
            if existing.scalar_one_or_none():
                continue

            upper, lower = calculate_psx_circuit_locks(item["current_price"])
            stock = Stock(
                symbol=sym,
                name=item["name"],
                sector=item["sector"],
                is_kmi30_shariah=item["is_kmi30"],
                current_price=item["current_price"],
                change_amount=item["change_amount"],
                change_percent=item["change_percent"],
                daily_upper_lock=upper,
                daily_lower_lock=lower,
                volume=item["volume"],
                market_cap_pkr=item["market_cap_pkr"],
                pe_ratio=item["pe_ratio"],
                rsi_14=item["rsi_14"]
            )
            session.add(stock)
        await session.commit()

        # 2. Seed 60 Days Historical OHLCV Candles
        logger.info("Seeding historical OHLCV series...")
        for item in symbols_data:
            sym = item["symbol"]
            candles = PSXDataIngestionService.generate_synthetic_historical_candles(
                symbol=sym,
                current_price=item["current_price"],
                days=60
            )
            for c in candles:
                c_date = date.fromisoformat(c["date"])
                existing = await session.execute(
                    select(HistoricalOHLCV).where(
                        HistoricalOHLCV.stock_symbol == sym,
                        HistoricalOHLCV.trading_date == c_date
                    )
                )
                if not existing.scalar_one_or_none():
                    record = HistoricalOHLCV(
                        stock_symbol=sym,
                        trading_date=c_date,
                        open=c["open"],
                        high=c["high"],
                        low=c["low"],
                        close=c["close"],
                        volume=c["volume"]
                    )
                    session.add(record)
        await session.commit()

        # 3. Seed Macro Indicators
        logger.info("Seeding Macro Pulse indicators...")
        macros = [
            MacroIndicator(
                code="KSE100",
                name="KSE-100 Index",
                current_value=118450.20,
                change_amount=1310.0,
                change_percent=1.12,
                formatted_value="118,450.20",
                subtext="+1.12% (+1,310 pts) • SBP/PSX Realtime"
            ),
            MacroIndicator(
                code="USD_PKR",
                name="USD / PKR Parity",
                current_value=278.50,
                change_amount=-0.15,
                change_percent=-0.05,
                formatted_value="278.50",
                subtext="-0.15% (Stable) • Interbank Weighted"
            ),
            MacroIndicator(
                code="SBP_RATE",
                name="SBP Policy Rate",
                current_value=12.00,
                change_amount=-2.00,
                change_percent=-14.28,
                formatted_value="12.00%",
                subtext="MPC Easing Cycle (-200 bps)"
            ),
            MacroIndicator(
                code="KMI30",
                name="KMI-30 Islamic Index",
                current_value=182310.00,
                change_amount=2610.0,
                change_percent=1.45,
                formatted_value="182,310.00",
                subtext="+1.45% • Shariah Benchmark"
            )
        ]
        for m in macros:
            existing = await session.execute(select(MacroIndicator).where(MacroIndicator.code == m.code))
            if not existing.scalar_one_or_none():
                session.add(m)
        await session.commit()

        # 4. Seed News Catalysts (Tier 1 vs Tier 2)
        logger.info("Seeding News Catalysts & Rumor Intelligence...")
        pucars = await TwoTierNewsScraperService.fetch_pucars_announcements()
        rumors = await TwoTierNewsScraperService.fetch_social_rumors()
        
        for item in (pucars + rumors):
            sentiment = NLPSentimentService.score_text(
                text=item["headline"] + " " + item["summary"],
                source_type=item["source_type"]
            )
            cat = NewsCatalyst(
                stock_symbol=item.get("stock_symbol"),
                headline=item["headline"],
                summary=item["summary"],
                source_name=item["source_name"],
                source_type=item["source_type"],
                credibility_weight=sentiment["credibility_weight"],
                raw_sentiment=sentiment["raw_sentiment"],
                weighted_sentiment=sentiment["weighted_sentiment"],
                sentiment_type=sentiment["sentiment_type"],
                url=item["url"],
                published_at=item["published_at"]
            )
            session.add(cat)
        await session.commit()

        # 5. Seed Watchlist
        logger.info("Seeding initial Watchlist items...")
        for sym in ["SYS", "MEBL", "PPL", "FFC"]:
            existing = await session.execute(select(WatchlistItem).where(WatchlistItem.stock_symbol == sym))
            if not existing.scalar_one_or_none():
                session.add(WatchlistItem(stock_symbol=sym))
        await session.commit()

        logger.info("Database seeding complete! PSX Pulse AI is ready.")


if __name__ == "__main__":
    asyncio.run(seed())
