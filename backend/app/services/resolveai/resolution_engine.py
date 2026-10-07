from typing import Dict, Any
from app.schemas.investigation import (
    RecommendationResult, 
    IntentResult, 
    RootCauseResult, 
    PolicyResult, 
    RiskResult
)


class ResolutionEngine:
    """
    Resolution Action Recommendation Engine.
    Synthesizes diagnostic root causes, regulatory policies, and risk scores
    to formulate structured, actionable resolution directives.
    """

    @classmethod
    def recommend(
        cls,
        intent: IntentResult,
        root_cause: RootCauseResult,
        policy: PolicyResult,
        risk: RiskResult,
        transaction: Dict[str, Any]
    ) -> RecommendationResult:
        code = root_cause.root_cause_code
        amount = float(transaction.get("amount", 0.0))

        # 1. Hero Scenario: QR Payment Timeout
        if "GATEWAY_TIMEOUT" in code or intent.intent == "QR_PAYMENT_FAILURE":
            return RecommendationResult(
                action="RECONCILIATION",
                priority="HIGH",
                reason="Wallet debit confirmed but merchant settlement not confirmed.",
                risk=risk.risk_level,
                requires_human_approval=True,  # Human verification required as per hackathon specification
                suggested_refund_amount=amount,
                auto_executable=False
            )

        # 2. High Risk / Suspicious Anomaly
        if risk.risk_score >= 70.0 or "ANOMALOUS" in code:
            return RecommendationResult(
                action="TEMPORARY_HOLD",
                priority="CRITICAL",
                reason="High-confidence account takeover anomaly detected. Immediate fund quarantine required.",
                risk=risk.risk_level,
                requires_human_approval=True,
                suggested_refund_amount=0.0,
                auto_executable=False
            )

        # 3. Accidental Transfer Wrong Number
        if intent.intent == "WRONG_NUMBER_TRANSFER":
            return RecommendationResult(
                action="RECIPIENT_WITHDRAWAL_LOCK",
                priority="MEDIUM",
                reason="Customer reported accidental transfer within 2-hour window. Recipient wallet withdrawal locked for 24 hours.",
                risk=risk.risk_level,
                requires_human_approval=True,
                suggested_refund_amount=0.0,
                auto_executable=False
            )

        # Default / Verified
        return RecommendationResult(
            action="MANUAL_REVIEW",
            priority="LOW",
            reason="Transaction state is clean or pending standard banking window closure.",
            risk=risk.risk_level,
            requires_human_approval=True,
            suggested_refund_amount=0.0,
            auto_executable=False
        )


resolution_engine = ResolutionEngine()
