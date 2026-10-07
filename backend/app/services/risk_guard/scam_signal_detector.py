import re
from typing import Dict, Any, List, Optional


class ScamSignalDetector:
    """
    Analyzes customer complaints and communication logs for social engineering and scam signals.
    Recognizes patterns such as:
    - OTP / credential harvesting impersonation
    - Suspicious payment links / phishing vectors
    - Advance-fee / account unlock extortion fraud
    - False authority & customer service impersonation
    
    Adheres strictly to evidence governance:
    - Does NOT claim a URL or party is malicious without conclusive evidence.
    - Classifies as SCAM_SUSPECTED with calibrated confidence.
    """

    CATEGORIES = {
        "OTP_HARVESTING": {
            "title": "Credential / OTP Harvesting Impersonation",
            "confidence": 0.97,
            "patterns": [
                r"\b(share|give|asked.*for|send).*(otp|pin|password|verification\s*code)\b",
                r"\b(otp|pin)\s*(share|dite|chaise|cheyeche|bolse)\b",
                r"\b(one-time\s*password|secret\s*code)\b",
                r"\botp.*share\b"
            ],
            "description": "Third party soliciting confidential one-time password or PIN under false pretexts.",
            "advisory": "Never share your Upay PIN or OTP with anyone, including individuals claiming to be bank or Upay representatives.",
            "action": "Immediate credential rotation & temporary outbound transfer hold"
        },
        "SUSPICIOUS_PAYMENT_LINK": {
            "title": "Unverified External Payment Link / Phishing",
            "confidence": 0.94,
            "patterns": [
                r"\b(suspicious|fake|unknown|weird).*(link|url|website)\b",
                r"\b(sent|received).*(payment\s*link|link)\b",
                r"\b(link\s*pathaise|link.*click|payment\s*link)\b",
                r"\b(http[s]?://|bit\.ly|tinyurl)\b"
            ],
            "description": "Customer directed to unverified external payment portal or hyperlink via SMS/messaging.",
            "advisory": "Do not enter wallet credentials or authorize approvals on external web links. Upay transactions only occur inside the official application or verified Bangla QR.",
            "action": "Flag domain for security sandboxing & advise customer not to interact"
        },
        "ACCOUNT_UNLOCK_EXTORTION": {
            "title": "Advance-Fee Account Unlock Solicitation",
            "confidence": 0.96,
            "patterns": [
                r"\b(send|pay|deposit).*money.*(unlock|unfreeze|activate).*account\b",
                r"\b(taka.*pathate|send\s*money).*(unlock|block|chalu)\b",
                r"\b(unlock|reactivate).*(fee|charge|deposit)\b",
                r"\baccount.*(block|freeze).*taka\b"
            ],
            "description": "Demand for advance fund transfer under false claim of unfreezing or unlocking wallet account.",
            "advisory": "Upay never requests customers to transfer money to personal numbers or merchant terminals to unlock accounts.",
            "action": "Confirm account status with customer service and warn against advance payments"
        },
        "CUSTOMER_CARE_IMPERSONATION": {
            "title": "Support Representative Impersonation",
            "confidence": 0.92,
            "patterns": [
                r"\b(claimed.*to\s*be|pretending.*as).*(upay|customer\s*care|agent|officer)\b",
                r"\b(helpline.*theke|officer.*bolchi)\b",
                r"\b(bkash|nagad|upay).*(head\s*office|support)\b"
            ],
            "description": "Caller falsely claiming official affiliation to coerce customer action.",
            "advisory": "Official Upay support only communicates through verified 16268 helpline channels.",
            "action": "Log calling phone number to threat intelligence registry"
        }
    }

    @classmethod
    def analyze_complaint(cls, complaint_text: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyzes natural language complaint for scam signals and provides structured assessment.
        """
        text = (complaint_text or "").strip()
        lower_text = text.lower()

        matched_categories = []
        extracted_indicators = []

        for cat_id, cat_info in cls.CATEGORIES.items():
            for pattern in cat_info["patterns"]:
                if re.search(pattern, lower_text):
                    if cat_id not in matched_categories:
                        matched_categories.append(cat_id)
                        extracted_indicators.append(f"Triggered pattern: {pattern}")
                    break

        is_scam = len(matched_categories) > 0

        if is_scam:
            primary_cat_id = matched_categories[0]
            cat_data = cls.CATEGORIES[primary_cat_id]
            classification = "SCAM_SUSPECTED"
            confidence = cat_data["confidence"]
            title = cat_data["title"]
            description = cat_data["description"]
            advisory = cat_data["advisory"]
            action = cat_data["action"]

            # Nuanced URL notice if payment link category
            url_note = ""
            if primary_cat_id == "SUSPICIOUS_PAYMENT_LINK":
                url_note = (
                    " Risk Guard notes: Without verified threat intelligence or URL sandbox analysis, "
                    "the link is classified as an unverified external resource rather than definitively malicious. "
                    "Protective caution is strongly advised."
                )

            cautious_assessment = (
                f"Customer narrative indicates hallmarks of {title.lower()}. "
                f"{description}{url_note} Recommended risk posture: Treat as potential social engineering attempt."
            )
        else:
            classification = "STANDARD_DISPUTE_OR_INQUIRY"
            confidence = 0.85
            title = "Standard MFS Transaction Inquiry"
            advisory = "Standard dispute handling guidelines apply."
            action = "Route to automated transaction investigation"
            cautious_assessment = (
                "No overt social engineering or scam solicitation patterns detected in customer submission. "
                "Classified as regular technical, billing, or ledger inquiry."
            )

        return {
            "classification": classification,
            "is_scam_suspected": is_scam,
            "confidence": confidence,
            "category_id": matched_categories[0] if matched_categories else "GENERAL",
            "category_title": title,
            "matched_categories": matched_categories,
            "extracted_indicators": extracted_indicators,
            "cautious_assessment": cautious_assessment,
            "safety_advisory": advisory,
            "recommended_action": action,
            "input_text": text
        }


scam_signal_detector = ScamSignalDetector()
