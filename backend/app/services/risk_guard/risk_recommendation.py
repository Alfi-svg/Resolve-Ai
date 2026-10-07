from typing import Dict, Any, List


class RiskRecommendationEngine:
    """
    Formulates actionable governance recommendations and available human decision pathways.
    """

    HUMAN_DECISIONS = [
        {
            "id": "REQUIRE_ADDITIONAL_VERIFICATION",
            "label": "Require Additional Verification",
            "description": "Trigger step-up biometric prompt, video KYC, or automated outbound voice confirmation.",
            "variant": "warning"
        },
        {
            "id": "AUTHORIZE_TEMPORARY_HOLD",
            "label": "Authorize Temporary Hold",
            "description": "Place a 24-hour escrow hold on transfer funds to prevent irreversible cash-out drainage.",
            "variant": "danger"
        },
        {
            "id": "SEND_TO_MANUAL_REVIEW",
            "label": "Send to Manual Review",
            "description": "Route transaction dossier to Senior Fraud Operations (L2 Analyst) queue.",
            "variant": "primary"
        },
        {
            "id": "CLEAR_FALSE_POSITIVE",
            "label": "Clear False Positive",
            "description": "Mark observed signals as benign customer behavioral variation and clear transaction.",
            "variant": "outline"
        }
    ]

    @classmethod
    def evaluate_recommendations(
        cls,
        scoring_result: Dict[str, Any],
        transaction: Dict[str, Any]
    ) -> Dict[str, Any]:
        risk_level = scoring_result.get("risk_level", "LOW")
        score = scoring_result.get("score", 0)

        if risk_level == "HIGH":
            primary_action = "Require Admin Review"
            safeguards = [
                "Require additional verification (Biometric / Video KYC challenge)",
                "Temporarily hold workflow (Prevent outgoing cash-out)",
                "Apply Policy POL-MFS-002: Quarantine funds pending customer verification"
            ]
            urgency = "IMMEDIATE"
            recommended_decision_id = "REQUIRE_ADDITIONAL_VERIFICATION"
        elif risk_level == "MEDIUM":
            primary_action = "Require Additional Verification"
            safeguards = [
                "Dispatch in-app push notification with interactive confirmation",
                "Require biometric re-authentication upon next session"
            ]
            urgency = "STANDARD"
            recommended_decision_id = "REQUIRE_ADDITIONAL_VERIFICATION"
        else:
            primary_action = "Approve & Passive Monitor"
            safeguards = [
                "Standard transaction processing",
                "Log device and telemetry metadata to routine audit journal"
            ]
            urgency = "LOW"
            recommended_decision_id = "CLEAR_FALSE_POSITIVE"

        return {
            "primary_recommendation": primary_action,
            "urgency": urgency,
            "safeguards": safeguards,
            "recommended_decision_id": recommended_decision_id,
            "human_decisions": cls.HUMAN_DECISIONS,
            "policy_applied": {
                "id": "POL-MFS-002",
                "title": "High-Risk Account Takeover & Anomaly Quarantine",
                "summary": "Mandates fund holds and step-up verification for compound high-risk behavioral anomalies."
            }
        }


risk_recommendation_engine = RiskRecommendationEngine()
