import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.database import Base, get_db
from app.main import app
from app.models.stock import Stock
from app.models.market_data import MacroIndicator
from app.models.catalyst import NewsCatalyst
from app.models.watchlist import WatchlistItem
from app.services.psx_ingestion import calculate_psx_circuit_locks

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


@pytest_asyncio.fixture(scope="function")
async def db_session():
    """Creates a fresh in-memory database schema for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        # Seed test stocks
        upper_sys, lower_sys = calculate_psx_circuit_locks(482.40)
        sys_stock = Stock(
            symbol="SYS",
            name="Systems Limited",
            sector="Technology",
            is_kmi30_shariah=True,
            current_price=482.40,
            change_amount=8.75,
            change_percent=1.85,
            daily_upper_lock=upper_sys,
            daily_lower_lock=lower_sys,
            volume=3420000,
            market_cap_pkr=138.5e9,
            pe_ratio=16.4,
            rsi_14=58.2
        )
        upper_mebl, lower_mebl = calculate_psx_circuit_locks(246.80)
        mebl_stock = Stock(
            symbol="MEBL",
            name="Meezan Bank Limited",
            sector="Commercial Banks",
            is_kmi30_shariah=True,
            current_price=246.80,
            change_amount=5.10,
            change_percent=2.10,
            daily_upper_lock=upper_mebl,
            daily_lower_lock=lower_mebl,
            volume=2140000,
            market_cap_pkr=441.2e9,
            pe_ratio=4.1,
            rsi_14=64.7
        )
        session.add_all([sys_stock, mebl_stock])

        # Seed macro
        kse = MacroIndicator(
            code="KSE100",
            name="KSE-100 Index",
            current_value=118450.20,
            change_amount=1310.0,
            change_percent=1.12,
            formatted_value="118,450.20",
            subtext="+1.12% (+1,310 pts)"
        )
        session.add(kse)

        # Seed catalyst
        cat = NewsCatalyst(
            stock_symbol="SYS",
            headline="Systems Limited announces 50% interim cash dividend",
            summary="Official PSX PUCARS notice confirms board approval for cash dividend.",
            source_name="PSX PUCARS",
            source_type="PUCARS",
            credibility_weight=1.0,
            raw_sentiment=0.85,
            weighted_sentiment=0.85,
            sentiment_type="BULLISH",
            url="https://dps.psx.com.pk/announcements/sys"
        )
        session.add(cat)
        await session.commit()

        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Async test client with DB override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
