import os
import json
import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("upay_resolveai.gemini")

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"


class GeminiService:
    """
    Real Google Gemini API Integration for ResolveAI Transaction Intelligence.
    Never exposes API key to frontend.
    LLM evaluates structured context assembled by FastAPI and returns validated JSON.
    """

    @classmethod
    def get_api_key(cls) -> Optional[str]:
        return settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

    @classmethod
    def is_configured(cls) -> bool:
        key = cls.get_api_key()
        return bool(key and key.strip())

    @classmethod
    async def analyze_dispute(
        cls,
        complaint: str,
        transaction: Dict[str, Any],
        evidence_items: list,
        timeline_items: list,
        policy: Dict[str, Any],
        risk: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        api_key = cls.get_api_key()
        if not api_key:
            logger.info("GEMINI_API_KEY not configured. Falling back to deterministic demo mode.")
            return None

        prompt = f"""
You are the ResolveAI Transaction Intelligence Engine for Upay MFS (Bangladesh).
Your job is to analyze this customer transaction complaint using the structured evidence provided.

RULES:
1. DO NOT invent transaction IDs, amounts, timestamps, or bank policies.
2. Use the provided backend evidence as authoritative truth.
3. Classify language as "bangla", "banglish", or "english".
4. Recommend action with requires_human_approval=true.
5. Return ONLY a single valid JSON object adhering to this exact schema:

{{
  "intent": "QR_PAYMENT_NOT_RECEIVED",
  "language": "banglish",
  "entities": {{
    "amount": {transaction.get('amount', 2000)},
    "merchant": "{transaction.get('merchant_name', 'ABC Cafe')}"
  }},
  "transaction_id": "{transaction.get('id', 'TXN-8F31A2')}",
  "transaction_status": "DEBITED",
  "issue": "Merchant did not receive payment",
  "evidence": [
    {{
      "source": "Wallet Ledger",
      "status": "confirmed",
      "fact": "Wallet debit recorded"
    }},
    {{
      "source": "Gateway Event",
      "status": "confirmed",
      "fact": "Gateway confirmation timeout"
    }},
    {{
      "source": "Merchant Event",
      "status": "missing",
      "fact": "Merchant settlement not received"
    }},
    {{
      "source": "Settlement Event",
      "status": "missing",
      "fact": "Settlement record unavailable"
    }}
  ],
  "root_cause": {{
    "code": "GATEWAY_CONFIRMATION_TIMEOUT",
    "explanation": "The payment was debited from user wallet but gateway confirmation timed out before merchant terminal could be credited."
  }},
  "risk": {{
    "score": {risk.get('risk_score', 18)},
    "level": "{risk.get('risk_level', 'LOW')}",
    "signals": []
  }},
  "policy": {{
    "name": "{policy.get('name', 'QR Payment Reconciliation')}",
    "allowed_action": "INITIATE_RECONCILIATION"
  }},
  "recommendation": {{
    "action": "INITIATE_RECONCILIATION",
    "requires_human_approval": true,
    "reason": "Merchant settlement is missing while customer wallet debit is confirmed."
  }},
  "customer_message": "Friendly explanation to customer explaining what happened in simple language.",
  "admin_summary": "Technical forensic summary for financial operations lead."
}}

CUSTOMER COMPLAINT:
"{complaint}"

STRUCTURED BACKEND EVIDENCE:
- Transaction: {json.dumps(transaction, default=str)}
- Evidence Sources: {[e if isinstance(e, dict) else e.__dict__ for e in evidence_items]}
- Policy: {json.dumps(policy, default=str)}
- Risk Guard: {json.dumps(risk, default=str)}
"""

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2
            }
        }

        url = f"{GEMINI_API_URL}?key={api_key}"

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code != 200:
                    logger.warning(f"Gemini API returned {resp.status_code}: {resp.text}")
                    return None

                data = resp.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    return None

                content_parts = candidates[0].get("content", {}).get("parts", [])
                if not content_parts:
                    return None

                text_out = content_parts[0].get("text", "")
                parsed = json.loads(text_out)
                logger.info("Successfully received structured response from Google Gemini 1.5 Flash.")
                return parsed

        except Exception as e:
            logger.warning(f"Gemini API invocation error: {e}. Falling back to deterministic demo engine.")
            return None


gemini_service = GeminiService()
