from typing import List, Dict, Any
import numpy as np
import pandas as pd


class FeatureEngineService:
    """
    Computes technical and statistical features over OHLCV series.
    """

    @staticmethod
    def compute_rsi(prices: List[float], period: int = 14) -> float:
        """
        Calculates Wilder's Relative Strength Index (RSI).
        """
        if len(prices) < period + 1:
            return 50.0

        deltas = np.diff(prices)
        gains = np.maximum(deltas, 0)
        losses = np.abs(np.minimum(deltas, 0))

        avg_gain = np.mean(gains[:period])
        avg_loss = np.mean(losses[:period])

        for i in range(period, len(deltas)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100.0 - (100.0 / (1.0 + rs))
        return round(float(rsi), 2)

    @staticmethod
    def compute_ema(prices: List[float], period: int) -> float:
        """
        Calculates Exponential Moving Average (EMA).
        """
        if not prices:
            return 0.0
        if len(prices) < period:
            return float(np.mean(prices))
        
        weights = np.exp(np.linspace(-1., 0., period))
        weights /= weights.sum()
        ema = np.convolve(prices[-period:], weights, mode='valid')
        return round(float(ema[-1]), 2)

    @staticmethod
    def compute_volume_zscore(volumes: List[int], period: int = 20) -> float:
        """
        Computes volume z-score: (current_vol - mean_vol) / std_vol
        """
        if len(volumes) < period:
            return 0.0
        
        recent = volumes[-period:]
        mean_vol = np.mean(recent)
        std_vol = np.std(recent)
        
        if std_vol == 0:
            return 0.0
        
        z = (volumes[-1] - mean_vol) / std_vol
        return round(float(z), 2)

    @classmethod
    def extract_feature_vector(cls, candles: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extracts comprehensive tabular feature dictionary from candle history.
        """
        if not candles:
            return {
                "rsi_14": 50.0,
                "ema_20": 0.0,
                "ema_50": 0.0,
                "volume_zscore": 0.0,
                "volatility_14d": 0.02,
                "return_5d": 0.0,
                "return_14d": 0.0
            }

        closes = [c["close"] for c in candles]
        volumes = [c["volume"] for c in candles]

        rsi_14 = cls.compute_rsi(closes, period=14)
        ema_20 = cls.compute_ema(closes, period=20)
        ema_50 = cls.compute_ema(closes, period=50)
        vol_z = cls.compute_volume_zscore(volumes, period=20)

        # 5-day and 14-day trailing returns
        ret_5d = ((closes[-1] - closes[-6]) / closes[-6]) if len(closes) >= 6 else 0.0
        ret_14d = ((closes[-1] - closes[-15]) / closes[-15]) if len(closes) >= 15 else 0.0

        # Realized 14-day volatility
        pct_changes = [
            (closes[i] - closes[i - 1]) / closes[i - 1]
            for i in range(1, len(closes))
        ]
        vol_14d = float(np.std(pct_changes[-14:])) if len(pct_changes) >= 14 else 0.015

        return {
            "rsi_14": rsi_14,
            "ema_20": ema_20,
            "ema_50": ema_50,
            "volume_zscore": vol_z,
            "volatility_14d": round(vol_14d, 4),
            "return_5d": round(ret_5d, 4),
            "return_14d": round(ret_14d, 4)
        }
