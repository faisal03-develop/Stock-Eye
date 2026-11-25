from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "PSX Pulse AI Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./psx_pulse.db",
        description="Async database connection string"
    )
    SYNC_DATABASE_URL: str = "sqlite:///./psx_pulse.db"

    # Redis Cache & Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # PSX Market Rules & Timing
    PSX_MARKET_OPEN_PKT: str = "09:30"
    PSX_MARKET_CLOSE_PKT: str = "15:30"
    PSX_TIMEZONE: str = "Asia/Karachi"
    PSX_CIRCUIT_BREAKER_PCT: float = 0.075  # ±7.5% standard daily band
    PSX_CIRCUIT_BREAKER_MIN_PKR: float = 1.00  # Minimum 1.00 PKR change threshold

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    # Mandatory Legal Disclaimer
    EDUCATIONAL_DISCLAIMER: str = (
        "Probabilistic AI analytics for educational purposes only. "
        "Not SECP-registered investment advice."
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
