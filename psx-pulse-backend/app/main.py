import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis_client import cache
from app.api.v1.router import api_v1_router
from scripts.seed_demo_data import seed

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("psx_pulse_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan: sets up DB tables, seeds demo data if empty, and connects cache.
    """
    logger.info("Initializing PSX Pulse AI backend service...")
    
    # 1. Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # 2. Seed initial data
    try:
        await seed()
    except Exception as e:
        logger.warning("Seed warning: %s", e)

    # 3. Connect Redis cache
    await cache.connect()

    yield

    # Teardown
    await cache.disconnect()
    await engine.dispose()
    logger.info("PSX Pulse AI backend shut down cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-ready backend for PSX Pulse AI — Pakistan Stock Exchange (PSX) "
        "stock prediction, technical feature engine, and news/rumor sentiment platform."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Service health check endpoint.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "market_hours_pkt": f"{settings.PSX_MARKET_OPEN_PKT} - {settings.PSX_MARKET_CLOSE_PKT}",
        "timestamp": datetime.utcnow().isoformat(),
        "disclaimer": settings.EDUCATIONAL_DISCLAIMER
    }


@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Welcome to PSX Pulse AI Backend API",
        "documentation": "/docs",
        "health": "/health"
    }
