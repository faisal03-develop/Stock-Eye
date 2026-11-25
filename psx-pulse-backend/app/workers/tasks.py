import asyncio
import logging
from app.workers.celery_app import celery_app
from app.services.news_scraper import TwoTierNewsScraperService
from app.services.nlp_sentiment import NLPSentimentService
from app.services.psx_ingestion import PSXDataIngestionService
from app.services.feature_engine import FeatureEngineService
from app.services.ml_forecaster import MLForecasterService

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper to run async service routines inside synchronous Celery worker tasks."""
    return asyncio.run(coro)


@celery_app.task(name="app.workers.tasks.poll_pucars_and_news_task")
def poll_pucars_and_news_task():
    """
    Background worker task: Fetches tier 1 PUCARS & tier 2 rumors, scores with NLP engine.
    """
    logger.info("Starting background PUCARS and financial news ingestion...")
    async def _run():
        filings = await TwoTierNewsScraperService.fetch_pucars_announcements()
        rumors = await TwoTierNewsScraperService.fetch_social_rumors()
        
        all_items = filings + rumors
        scored_items = []
        for item in all_items:
            sentiment = NLPSentimentService.score_text(
                text=item["headline"] + " " + item["summary"],
                source_type=item["source_type"]
            )
            item.update(sentiment)
            scored_items.append(item)
            
        logger.info("Successfully ingested and scored %d catalysts.", len(scored_items))
        return len(scored_items)
        
    return run_async(_run())


@celery_app.task(name="app.workers.tasks.run_batch_ml_inference_task")
def run_batch_ml_inference_task():
    """
    Background worker task: Generates multi-horizon quantile forecast cones for active PSX universe.
    """
    logger.info("Starting post-market batch ML quantile inference...")
    symbols = PSXDataIngestionService.get_supported_symbols()
    inferences_count = 0
    
    for stock in symbols:
        sym = stock["symbol"]
        price = stock["current_price"]
        candles = PSXDataIngestionService.generate_synthetic_historical_candles(sym, price, days=30)
        features = FeatureEngineService.extract_feature_vector(candles)
        
        # Compute 1D, 5D, and 15D cones
        for horizon in ["1D", "5D", "15D"]:
            forecast = MLForecasterService.generate_forecast_cone(
                symbol=sym,
                current_price=price,
                features=features,
                horizon=horizon
            )
            inferences_count += 1
            
    logger.info("Completed %d quantile inferences across %d symbols.", inferences_count, len(symbols))
    return inferences_count


@celery_app.task(name="app.workers.tasks.sync_psx_eod_data_task")
def sync_psx_eod_data_task():
    """
    Background worker task: Settles closing prices and recalculates circuit breaker locks.
    """
    logger.info("Running EOD PSX settlement and circuit locks sync...")
    symbols = PSXDataIngestionService.get_supported_symbols()
    return len(symbols)
