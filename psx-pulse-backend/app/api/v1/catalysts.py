from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.catalyst import NewsCatalyst
from app.schemas.catalyst import CatalystsResponse, NewsCatalystItem

router = APIRouter(prefix="/catalysts", tags=["News & Rumor Intelligence"])


@router.get("/{symbol}", response_model=CatalystsResponse)
async def get_catalysts_for_symbol(
    symbol: str,
    filter_type: str = Query("ALL", description="ALL | VERIFIED | RUMOR"),
    db: AsyncSession = Depends(get_db)
):
    """
    NLP Authenticity & Catalyst Engine feed for a specific stock or the broader market.
    """
    sym = symbol.upper()
    stmt = select(NewsCatalyst).order_by(NewsCatalyst.published_at.desc())

    if sym != "ALL":
        stmt = stmt.where((NewsCatalyst.stock_symbol == sym) | (NewsCatalyst.stock_symbol == None))

    if filter_type.upper() == "VERIFIED":
        stmt = stmt.where(NewsCatalyst.source_type.in_(["PUCARS", "VERIFIED_NEWS"]))
    elif filter_type.upper() == "RUMOR":
        stmt = stmt.where(NewsCatalyst.source_type == "RUMOR")

    res = await db.execute(stmt)
    records = res.scalars().all()

    verified_count = sum(1 for r in records if r.source_type in ["PUCARS", "VERIFIED_NEWS"])
    rumor_count = sum(1 for r in records if r.source_type == "RUMOR")

    items = []
    for r in records:
        items.append(
            NewsCatalystItem(
                id=r.id,
                stock_symbol=r.stock_symbol,
                headline=r.headline,
                summary=r.summary,
                source_name=r.source_name,
                source_type=r.source_type,
                credibility_weight=r.credibility_weight,
                raw_sentiment=r.raw_sentiment,
                weighted_sentiment=r.weighted_sentiment,
                sentiment_type=r.sentiment_type,
                url=r.url,
                published_at=r.published_at,
                time_ago="2h ago" if r.source_type == "PUCARS" else "42m ago"
            )
        )

    return CatalystsResponse(
        total=len(items),
        verified_count=verified_count,
        rumor_count=rumor_count,
        catalysts=items,
        disclaimer=settings.EDUCATIONAL_DISCLAIMER
    )
