from fastapi import APIRouter
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.stocks import router as stocks_router
from app.api.v1.catalysts import router as catalysts_router
from app.api.v1.watchlist import router as watchlist_router
from app.api.v1.accuracy import router as accuracy_router

api_v1_router = APIRouter()

api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(stocks_router)
api_v1_router.include_router(catalysts_router)
api_v1_router.include_router(watchlist_router)
api_v1_router.include_router(accuracy_router)
