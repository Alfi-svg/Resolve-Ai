from typing import Dict, Any, List


class PolicyService:
    """Policy RAG simulation for Bangladesh MFS regulations & Upay dispute resolution rules."""

    POLICIES = [
        {
            "id": "POL-MFS-001",
            "title": "Failed Downstream Gateway Instant Reversal",
            "category": "GATEWAY_FAILURE",
            "description": "If user wallet is debited but downstream partner/merchant switch returns timeout or negative settlement acknowledgment, funds must be refunded within 15 minutes upon automated ledger audit.",
            "sla_hours": 0.25,
            "auto_action": "INSTANT_REFUND"
        },
        {
            "id": "POL-MFS-002",
            "title": "Accidental Send Money Reversal / Hold Rule",
            "category": "WRONG_RECIPIENT",
            "description": "When a customer reports an accidental transfer to an unregistered or wrong recipient number within 2 hours, temporary withdrawal hold is applied on recipient wallet pending mutual consent or 24h verification.",
            "sla_hours": 24,
            "auto_action": "HOLD_FUNDS_AND_NOTIFY"
        },
        {
            "id": "POL-MFS-003",
            "title": "Agent Cash-Out ATM/POS Interruption Policy",
            "category": "CASH_OUT_DISPUTE",
            "description": "If cash-out transaction generated an OTP or PIN verification debit but agent POS terminal failed to dispense cash or crashed, reconcile with agent ledger. Immediate provisional credit authorized.",
            "sla_hours": 1.0,
            "auto_action": "PROVISIONAL_CREDIT"
        },
        {
            "id": "POL-MFS-004",
            "title": "Unauthorized Access & Social Engineering Fraud Rule",
            "category": "FRAUD_SUSPICION",
            "description": "If transaction triggered sudden device switch, unusual OTP resets, or rapid cascade transfers, freeze suspect target account immediately under BFIU Circular 28 guidance and escalate to Special Investigations Unit.",
            "sla_hours": 2.0,
            "auto_action": "FREEZE_TARGET_ESCALATE"
        }
    ]

    @classmethod
    def match_policy(cls, intent_category: str, error_code: str = None) -> Dict[str, Any]:
        """Matches the best applicable policy for the transaction dispute."""
        if error_code in ["ERR_GW_TIMEOUT", "ERR_SWITCH_REJECT", "ERR_BANK_CONN"] or intent_category == "FAILED_DEBIT_UNCREDITED":
            return cls.POLICIES[0]
        elif intent_category == "WRONG_NUMBER_TRANSFER":
            return cls.POLICIES[1]
        elif intent_category in ["AGENT_CASH_OUT_ISSUE", "CASH_OUT_FAILED"]:
            return cls.POLICIES[2]
        elif intent_category in ["SCAM_FRAUD_ALERT", "UNAUTHORIZED_TRANSFER"]:
            return cls.POLICIES[3]
        return cls.POLICIES[0]


policy_service = PolicyService()
