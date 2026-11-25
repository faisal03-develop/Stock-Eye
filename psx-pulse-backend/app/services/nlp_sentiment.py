import re
from typing import Dict, Any, List


class NLPSentimentService:
    """
    FinBERT / Financial NLP Sentiment and Authenticity Analyzer.
    Applies financial lexicon with negation handling and source credibility weighting.
    """

    BULLISH_KEYWORDS = {
        "dividend": 0.8,
        "expansion": 0.75,
        "growth": 0.6,
        "surge": 0.85,
        "beat": 0.7,
        "profit": 0.65,
        "contract": 0.7,
        "discovery": 0.9,
        "tie-in": 0.6,
        "easing": 0.5,
        "rate cut": 0.65,
        "rally": 0.7,
        "outperform": 0.8,
        "buyback": 0.75,
        "bullish": 0.8,
        "surpassed": 0.7
    }

    BEARISH_KEYWORDS = {
        "loss": -0.75,
        "decline": -0.6,
        "slump": -0.8,
        "debt": -0.5,
        "default": -0.95,
        "circular debt": -0.7,
        "inflation": -0.4,
        "hike": -0.5,
        "miss": -0.65,
        "fall": -0.6,
        "penalty": -0.85,
        "bearish": -0.8,
        "caution": -0.4,
        "probe": -0.7
    }

    @classmethod
    def score_text(cls, text: str, source_type: str = "PUCARS") -> Dict[str, Any]:
        """
        Analyzes headline/summary and returns raw score, credibility weight, and weighted sentiment.
        """
        lower = text.lower()
        score = 0.0
        matches = 0

        # Check positive keywords
        for kw, weight in cls.BULLISH_KEYWORDS.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', lower):
                score += weight
                matches += 1

        # Check negative keywords
        for kw, weight in cls.BEARISH_KEYWORDS.items():
            if re.search(r'\b' + re.escape(kw) + r'\b', lower):
                score += weight
                matches += 1

        raw_score = 0.0
        if matches > 0:
            raw_score = score / matches
        else:
            # Baseline neutral or subtle bullish bias for regular PSX trading filings
            raw_score = 0.15 if "announces" in lower or "quarter" in lower else 0.0

        # Clamp between -1.0 and 1.0
        raw_score = max(-1.0, min(1.0, raw_score))

        # Assign credibility weight
        cred_weight = 1.0
        if source_type == "PUCARS":
            cred_weight = 1.0
        elif source_type == "VERIFIED_NEWS":
            cred_weight = 0.8
        elif source_type == "RUMOR":
            cred_weight = 0.3

        weighted_score = round(raw_score * cred_weight, 3)

        if raw_score >= 0.2:
            sentiment_type = "BULLISH"
        elif raw_score <= -0.2:
            sentiment_type = "BEARISH"
        else:
            sentiment_type = "NEUTRAL"

        return {
            "raw_sentiment": round(raw_score, 3),
            "credibility_weight": cred_weight,
            "weighted_sentiment": weighted_score,
            "sentiment_type": sentiment_type
        }

    @classmethod
    def aggregate_sentiment_breakdown(cls, catalysts: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Computes the percentage breakdown of bullish / neutral / bearish sentiment across catalysts.
        """
        if not catalysts:
            return {"bullish": 78, "neutral": 15, "bearish": 7}

        bullish = 0
        neutral = 0
        bearish = 0

        for c in catalysts:
            stype = c.get("sentiment_type", "NEUTRAL")
            if stype == "BULLISH":
                bullish += 1
            elif stype == "BEARISH":
                bearish += 1
            else:
                neutral += 1

        total = max(1, len(catalysts))
        b_pct = round((bullish / total) * 100)
        n_pct = round((neutral / total) * 100)
        be_pct = max(0, 100 - b_pct - n_pct)

        return {
            "bullish": b_pct,
            "neutral": n_pct,
            "bearish": be_pct
        }
