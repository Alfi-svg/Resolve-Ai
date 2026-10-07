from typing import List, Dict, Any


class RiskScorer:
    """
    Computes deterministic risk score and assigns risk tier.
    Formula:
      raw_score = sum(signal.weight for signal in triggered_signals)
      score = min(100, raw_score)
    Tiers:
      0-30:   LOW
      31-60:  MEDIUM
      61-100: HIGH
    """

    TIER_LOW = "LOW"
    TIER_MEDIUM = "MEDIUM"
    TIER_HIGH = "HIGH"

    @classmethod
    def score_signals(cls, signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates triggered signals into a capped score and assigned risk level.
        """
        raw_score = sum(int(sig.get("weight", 0)) for sig in signals)
        score = min(100, raw_score)

        if score >= 61:
            tier = cls.TIER_HIGH
            tier_label = "High Risk"
            badge_color = "rose"
        elif score >= 31:
            tier = cls.TIER_MEDIUM
            tier_label = "Medium Risk"
            badge_color = "amber"
        else:
            tier = cls.TIER_LOW
            tier_label = "Low Risk"
            badge_color = "emerald"

        return {
            "score": score,
            "raw_score": raw_score,
            "max_score": 100,
            "risk_level": tier,
            "risk_level_label": tier_label,
            "badge_color": badge_color,
            "signal_count": len(signals),
            "signals": signals
        }


risk_scorer = RiskScorer()
