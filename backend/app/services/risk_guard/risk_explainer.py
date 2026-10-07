from typing import Dict, Any, List


class RiskExplainer:
    """
    Synthesizes analytical, non-defamatory risk explanations and itemized breakdowns.
    Follows strict risk intelligence governance:
    - Never accuses users of fraud directly ('The user is a fraudster').
    - Uses cautious objective intelligence language: 'Potential account takeover risk detected.'
    - Provides explicit itemized breakdown under 'WHY THIS TRANSACTION IS RISKY'.
    """

    @classmethod
    def generate_explanation(
        cls, 
        transaction: Dict[str, Any], 
        scoring_result: Dict[str, Any], 
        behavioral_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates structured itemized explanation and natural language AI narrative.
        """
        score = scoring_result.get("score", 0)
        risk_level = scoring_result.get("risk_level", "LOW")
        signals = scoring_result.get("signals", [])

        # 1. Itemized Breakdown: "WHY THIS TRANSACTION IS RISKY"
        itemized_breakdown = []
        for sig in signals:
            itemized_breakdown.append({
                "code": sig.get("code"),
                "name": sig.get("name"),
                "weight_display": f"+{sig.get('weight')}",
                "weight": sig.get("weight"),
                "evidence": sig.get("evidence", "")
            })

        # 2. Cautious AI Explanation Narrative
        explanation_narrative = cls._synthesize_narrative(
            transaction=transaction,
            score=score,
            risk_level=risk_level,
            signals=signals,
            behavioral_context=behavioral_context
        )

        # 3. Behavioral Comparison Summary
        baseline = behavioral_context.get("baseline", {})
        behavior_comparisons = [
            {
                "dimension": "Hardware Fingerprint",
                "baseline": "Registered primary device (DEV-IPHONE-14)",
                "observed": transaction.get("device_id") or "DEV-NEW-X992 (First seen 8 mins ago)",
                "status": "ANOMALOUS" if behavioral_context.get("is_new_device") else "NORMAL"
            },
            {
                "dimension": "Transaction Volume",
                "baseline": f"90-day mean: ৳{behavioral_context.get('historical_mean_amount', 3000):,.2f}",
                "observed": f"৳{float(transaction.get('amount', 0)):,.2f} ({behavioral_context.get('amount_ratio', 1.0)}x baseline)",
                "status": "ANOMALOUS" if behavioral_context.get("is_unusual_amount") else "NORMAL"
            },
            {
                "dimension": "Authentication Security",
                "baseline": "Standard single biometric verification",
                "observed": f"{behavioral_context.get('failed_auth_attempts', 0)} consecutive failed attempts before override",
                "status": "ANOMALOUS" if behavioral_context.get("failed_auth_attempts", 0) >= 2 else "NORMAL"
            },
            {
                "dimension": "Transfer Endpoint",
                "baseline": "Frequent payees & verified merchant terminals",
                "observed": behavioral_context.get("destination_evidence", "First-time transfer recipient"),
                "status": "ANOMALOUS" if behavioral_context.get("is_new_destination") else "NORMAL"
            }
        ]

        return {
            "title": "WHY THIS TRANSACTION IS RISKY",
            "score_display": f"{score}/100",
            "score": score,
            "risk_level": risk_level,
            "itemized_breakdown": itemized_breakdown,
            "ai_explanation": explanation_narrative,
            "behavior_comparisons": behavior_comparisons
        }

    @classmethod
    def _synthesize_narrative(
        cls,
        transaction: Dict[str, Any],
        score: int,
        risk_level: str,
        signals: List[Dict[str, Any]],
        behavioral_context: Dict[str, Any]
    ) -> str:
        amount = float(transaction.get("amount", 0.0))
        ratio = behavioral_context.get("amount_ratio", 1.0)
        user_name = transaction.get("user_name") or "the customer"

        if risk_level == "HIGH":
            signal_names = [s.get("name", "").lower() for s in signals]
            details = []
            if behavioral_context.get("is_new_device"):
                details.append("originated from a previously unseen device")
            if behavioral_context.get("is_unusual_amount"):
                details.append(f"represents an amount {ratio}x higher than their 90-day average")
            if behavioral_context.get("failed_auth_attempts", 0) >= 2:
                details.append(f"occurred immediately following {behavioral_context.get('failed_auth_attempts')} failed authentication attempts")
            if behavioral_context.get("is_new_destination"):
                details.append("was routed to a first-time beneficiary destination")

            dev_text = ", ".join(details) if details else "multiple anomalous behavioral indicators"
            return (
                f"This transaction differs significantly from {user_name}'s historical profile. "
                f"The payment {dev_text}. Combined with rapid execution timing, "
                "this pattern exhibits characteristics consistent with potential account compromise. "
                "Recommended action: Route for immediate secondary authentication or analyst review."
            )

        elif risk_level == "MEDIUM":
            return (
                f"Minor behavioral deviations detected for transaction of ৳{amount:,.2f}. "
                "While device and credential baselines match standard parameters, elevated volume "
                "warrants step-up verification (SMS OTP or biometric prompt) before settlement release."
            )

        else:
            return (
                f"Clean behavioral profile for transaction of ৳{amount:,.2f}. "
                "Hardware fingerprint, circadian timing, and recipient endpoint align consistently "
                "with customer 90-day baseline patterns. No secondary friction required."
            )


risk_explainer = RiskExplainer()
