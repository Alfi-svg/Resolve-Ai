from typing import List, Dict, Any
from app.schemas.investigation import PolicyResult, RootCauseResult, IntentResult


class PolicyEngine:
    """
    Regulatory Policy RAG Engine.
    Matches Bangladesh Bank BFIU guidelines, MFS regulations, and Upay dispute resolution rules
    against diagnostic root causes to determine authorized resolution pathways.
    """

    POLICY_CATALOG = {
        "QR_RECONCILIATION": {
            "id": "POL-QR-001",
            "title": "QR Payment Reconciliation Policy",
            "category": "GATEWAY_FAILURE",
            "reason": "Consumer protection rule mandates automated ledger reconciliation when customer wallet is debited but partner payment switch times out or drops merchant settlement.",
            "allowed_actions": ["RECONCILIATION", "INSTANT_REFUND", "SETTLEMENT_HOLD"],
            "sla_minutes": 15
        },
        "FRAUD_QUARANTINE": {
            "id": "POL-MFS-002",
            "title": "High-Risk Account Takeover & Anomaly Quarantine Policy",
            "category": "FRAUD_PREVENTION",
            "reason": "BFIU Circular 28 mandates immediate fund escrow and step-up biometric verification when composite risk score exceeds 75.0 on anomalous new device transactions.",
            "allowed_actions": ["QUARANTINE_HOLD", "TEMPORARY_FREEZE", "STEP_UP_AUTH", "SIU_ESCALATION"],
            "sla_minutes": 30
        },
        "WRONG_NUMBER": {
            "id": "POL-MFS-003",
            "title": "Accidental Send Money Recipient Withdrawal Lock Policy",
            "category": "WRONG_RECIPIENT",
            "reason": "When accidental transfer is reported within 2 hours of execution, apply temporary 24-hour withdrawal hold on recipient wallet pending mutual consent.",
            "allowed_actions": ["RECIPIENT_HOLD", "MUTUAL_SETTLEMENT_NOTICE", "MANUAL_REVIEW"],
            "sla_minutes": 120
        },
        "STANDARD": {
            "id": "POL-MFS-000",
            "title": "Standard MFS Transaction Integrity Policy",
            "category": "GENERAL_OPERATIONS",
            "reason": "Standard operational reconciliation guidelines governing Mobile Financial Service transactions.",
            "allowed_actions": ["RECONCILIATION", "MANUAL_REVIEW"],
            "sla_minutes": 1440
        }
    }

    @classmethod
    def match_policy(
        cls,
        intent: IntentResult,
        root_cause: RootCauseResult
    ) -> PolicyResult:
        code = root_cause.root_cause_code

        if "GATEWAY_TIMEOUT" in code or intent.intent in ["QR_PAYMENT_FAILURE", "WALLET_DEBITED_MERCHANT_NOT_CREDITED"]:
            pol = cls.POLICY_CATALOG["QR_RECONCILIATION"]
        elif "ANOMALOUS" in code or intent.intent == "UNAUTHORIZED_TRANSFER":
            pol = cls.POLICY_CATALOG["FRAUD_QUARANTINE"]
        elif "ACCIDENTAL" in code or intent.intent == "WRONG_NUMBER_TRANSFER":
            pol = cls.POLICY_CATALOG["WRONG_NUMBER"]
        else:
            pol = cls.POLICY_CATALOG["STANDARD"]

        return PolicyResult(
            matched_policy_id=pol["id"],
            matched_policy=pol["title"],
            category=pol["category"],
            policy_reason=pol["reason"],
            allowed_actions=pol["allowed_actions"],
            sla_minutes=pol["sla_minutes"]
        )


policy_engine = PolicyEngine()
