import re
from typing import Dict, Any, Optional
from app.schemas.investigation import IntentResult


class ComplaintParser:
    """
    NLP Intent Detection and Entity Extraction Engine.
    Parses Bengali, English, and Romanized Bengali (Banglish) financial complaints.
    """

    @classmethod
    def parse(cls, complaint_text: str) -> IntentResult:
        raw = complaint_text.strip()
        lower = raw.lower()

        # 1. Detect Language
        # If contains Bengali script (Unicode \u0980-\u09FF)
        has_bengali_unicode = bool(re.search(r'[\u0980-\u09FF]', raw))
        # Banglish indicators
        banglish_tokens = ["korechi", "kete", "geche", "pay", "nai", "taka", "theke", "bhul", "kore", "hoi", "hoise"]
        has_banglish = any(t in lower for t in banglish_tokens)

        language = "bn" if (has_bengali_unicode or has_banglish) else "en"

        # 2. Extract Amount
        amount: Optional[float] = None
        amount_match = re.search(r'(?:bdt|tk|৳|টাকা)?\s*([0-9]{2,7}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)\s*(?:tk|bdt|৳|টাকা)?', lower)
        if amount_match:
            try:
                cleaned = amount_match.group(1).replace(",", "")
                amount = float(cleaned)
            except ValueError:
                amount = None

        # 3. Extract Explicit TRX ID if mentioned (e.g. TXN-8F31A2, UPAY-9011)
        trx_match = re.search(r'\b(?:txn|trx|upay)[-_]?[a-z0-9]{4,10}\b', lower)
        extracted_trx = trx_match.group(0).upper() if trx_match else None

        # 4. Classify Intent & Issue
        entities: Dict[str, Any] = {}
        if extracted_trx:
            entities["explicit_transaction_id"] = extracted_trx
        if amount:
            entities["extracted_amount"] = amount

        # Check Scam Signals using Risk Guard ScamSignalDetector
        from app.services.risk_guard.scam_signal_detector import scam_signal_detector
        scam_eval = scam_signal_detector.analyze_complaint(raw)
        if scam_eval.get("is_scam_suspected"):
            intent = "SCAM_SUSPECTED"
            issue = scam_eval.get("category_id", "SOCIAL_ENGINEERING_SCAM")
            confidence = scam_eval.get("confidence", 0.95)
            entities["scam_details"] = scam_eval
            entities["security_alert"] = True
        elif (
            any(w in lower for w in [
                "shopkeeper", "dokandar", "দোকানদার", "pay nai", "পায়নি", 
                "money cut but", "taka katshe", "টাকা কেটেছে", "merchant pay nai"
            ]) or 
            any(w in lower for w in ["qr", "bangla qr", "scan", "merchant", "cafe", "store", "restaurant", "shwapno", "bill"])
        ):
            intent = "WALLET_DEBITED_MERCHANT_NOT_CREDITED"
            issue = "WALLET_DEBITED_MERCHANT_NOT_CREDITED"
            confidence = 0.98
            entities["channel_hint"] = "QR_OR_MERCHANT"
        elif any(w in lower for w in ["cash out", "cashout", "atm", "agent", "booth", "payout"]):
            intent = "CASH_OUT_FAILURE"
            issue = "WALLET_DEBITED_CASH_NOT_DISPENSED"
            confidence = 0.95
            entities["channel_hint"] = "AGENT_OR_ATM"
        elif any(w in lower for w in ["wrong number", "bhul", "mistake", "accidental", "unintended", "wrong person"]):
            intent = "WRONG_NUMBER_TRANSFER"
            issue = "ACCIDENTAL_TRANSFER_WRONG_RECIPIENT"
            confidence = 0.94
            entities["channel_hint"] = "SEND_MONEY"
        elif any(w in lower for w in ["hacked", "stolen", "unauthorized", "scam", "fraud", "takeover", "compromised"]):
            intent = "UNAUTHORIZED_TRANSFER"
            issue = "SUSPECTED_ACCOUNT_TAKEOVER"
            confidence = 0.96
            entities["security_alert"] = True
        elif any(w in lower for w in ["failed", "kete geche", "deducted", "cut", "not received", "uncredited"]):
            intent = "GENERAL_PAYMENT_FAILURE"
            issue = "UNRECONCILED_DEBIT"
            confidence = 0.91
        else:
            intent = "GENERAL_INQUIRY"
            issue = "UNKNOWN_ISSUE"
            confidence = 0.85

        return IntentResult(
            intent=intent,
            amount=amount,
            issue=issue,
            language=language,
            confidence=confidence,
            raw_complaint=raw,
            extracted_entities=entities
        )


complaint_parser = ComplaintParser()
