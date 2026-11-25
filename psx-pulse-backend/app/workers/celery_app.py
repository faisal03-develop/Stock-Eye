from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "psx_pulse_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone=settings.PSX_TIMEZONE,
    enable_utc=True,
    broker_connection_retry_on_startup=True
)

# Automated Beat Schedule
celery_app.conf.beat_schedule = {
    # 1. Market Hours News Polling (Every 15m between 09:30 - 15:30 PKT, Mon-Fri)
    "poll-pucars-and-market-news": {
        "task": "app.workers.tasks.poll_pucars_and_news_task",
        "schedule": crontab(minute="*/15", hour="9-15", day_of_week="mon,tue,wed,thu,fri")
    },
    # 2. Post-Close Batch ML Inference & Forecast Generation (16:30 PKT, Mon-Fri)
    "post-close-batch-ml-inference": {
        "task": "app.workers.tasks.run_batch_ml_inference_task",
        "schedule": crontab(minute="30", hour="16", day_of_week="mon,tue,wed,thu,fri")
    },
    # 3. End-Of-Day OHLCV Settlement & Circuit Breakers Update (17:00 PKT)
    "eod-ohlcv-settlement-sync": {
        "task": "app.workers.tasks.sync_psx_eod_data_task",
        "schedule": crontab(minute="0", hour="17", day_of_week="mon,tue,wed,thu,fri")
    }
}
