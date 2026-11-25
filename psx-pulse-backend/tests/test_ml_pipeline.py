import pytest
from app.services.psx_ingestion import (
    calculate_psx_circuit_locks,
    calculate_horizon_circuit_bounds,
    is_kmi30_compliant
)
from app.services.feature_engine import FeatureEngineService
from app.services.nlp_sentiment import NLPSentimentService
from app.services.ml_forecaster import MLForecasterService


def test_circuit_breakers_standard():
    # PSX Rule: ±7.5% or PKR 1.00, whichever is higher
    # Price = 100.00 -> 7.5% is 7.50 -> upper = 107.50, lower = 92.50
    upper, lower = calculate_psx_circuit_locks(100.00)
    assert upper == 107.50
    assert lower == 92.50

    # Low-priced penny stock: Price = 5.00 -> 7.5% is 0.375 < 1.00 minimum
    # Should use 1.00 delta -> upper = 6.00, lower = 4.00
    upper_penny, lower_penny = calculate_psx_circuit_locks(5.00)
    assert upper_penny == 6.00
    assert lower_penny == 4.00


def test_horizon_circuit_bounds():
    # Horizon 5D: compound daily max limit (1.075^5)
    max_5d, min_5d = calculate_horizon_circuit_bounds(100.00, 5)
    assert max_5d > 107.50  # Must be higher than single day
    assert min_5d < 92.50   # Must be lower than single day
    assert max_5d == round(100.00 * (1.075 ** 5), 2)


def test_kmi30_compliance_check():
    assert is_kmi30_compliant("SYS") is True
    assert is_kmi30_compliant("MEBL") is True
    assert is_kmi30_compliant("UNKNOWN_STOCK_XYZ") is False


def test_technical_feature_engineering():
    # Generate monotonic upward series
    prices = [100.0 + i * 2.0 for i in range(30)]
    rsi = FeatureEngineService.compute_rsi(prices, period=14)
    assert rsi > 70.0  # Consistently rising prices produce overbought RSI > 70

    ema = FeatureEngineService.compute_ema(prices, period=20)
    assert ema > 100.0

    volumes = [1000 + i * 100 for i in range(25)]
    volumes[-1] = 10000  # Massive spike
    z = FeatureEngineService.compute_volume_zscore(volumes, period=20)
    assert z > 2.0  # Significant z-score spike


def test_nlp_sentiment_scoring_and_weights():
    # Tier 1: PUCARS with dividend and expansion
    pucars_text = "Systems Limited announces 50% interim cash dividend and MENA expansion contract"
    res_pucars = NLPSentimentService.score_text(pucars_text, source_type="PUCARS")
    assert res_pucars["sentiment_type"] == "BULLISH"
    assert res_pucars["credibility_weight"] == 1.0
    assert res_pucars["weighted_sentiment"] > 0.5

    # Tier 2: Rumor with buyback chatter
    rumor_text = "Speculation circulating on WhatsApp groups regarding potential share buyback"
    res_rumor = NLPSentimentService.score_text(rumor_text, source_type="RUMOR")
    assert res_rumor["credibility_weight"] == 0.3
    # Weighted sentiment must be discounted due to rumor tier
    assert res_rumor["weighted_sentiment"] <= res_rumor["raw_sentiment"] * 0.31

    # Bearish headline
    bear_text = "Declining oil demand causes quarterly loss and circular debt slump"
    res_bear = NLPSentimentService.score_text(bear_text, source_type="VERIFIED_NEWS")
    assert res_bear["sentiment_type"] == "BEARISH"
    assert res_bear["raw_sentiment"] < 0.0


def test_quantile_forecast_cone_monotonicity_and_circuit_locks():
    symbol = "SYS"
    current_price = 482.40
    features = {
        "rsi_14": 58.2,
        "volume_zscore": 2.4,
        "volatility_14d": 0.018
    }

    forecast = MLForecasterService.generate_forecast_cone(
        symbol=symbol,
        current_price=current_price,
        features=features,
        sentiment_score=0.75,
        horizon="15D"
    )

    cone = forecast["forecast_cone"]
    assert len(cone) == 15

    for idx, point in enumerate(cone, start=1):
        p10 = point["p10"]
        p50 = point["p50"]
        p90 = point["p90"]

        # 1. Monotonicity constraint: p10 <= p50 <= p90
        assert p10 <= p50, f"Step {idx}: p10 ({p10}) must be <= p50 ({p50})"
        assert p50 <= p90, f"Step {idx}: p50 ({p50}) must be <= p90 ({p90})"

        # 2. Cumulative PSX Circuit Breakers Constraint
        max_bound, min_bound = calculate_horizon_circuit_bounds(current_price, idx)
        assert p90 <= max_bound + 0.01, f"Step {idx}: p90 ({p90}) exceeded PSX limit ({max_bound})"
        assert p10 >= min_bound - 0.01, f"Step {idx}: p10 ({p10}) breached lower PSX limit ({min_bound})"

    # Verdict & explainability checks
    verdict = forecast["verdict"]
    assert verdict["direction"] in ["BULLISH", "BEARISH", "NEUTRAL"]
    assert 0.0 <= verdict["profit_probability"] <= 1.0
    assert 0.0 <= verdict["confidence_score"] <= 1.0

    drivers = forecast["explainability_drivers"]
    assert len(drivers) == 3
    assert drivers[0]["impact_pct"] > 0
