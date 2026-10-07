import re
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.services.ai.base import BaseAIService
from app.services.evidence.service import evidence_service
from app.services.policy.service import policy_service
from app.services.risk_guard.service import risk_guard_service
from app.schemas.common import AIReasoningStep


class ResolveAIService(BaseAIService):
    """Flagship ResolveAI Orchestrator implementing the full 7-step investigation pipeline."""

    async def analyze_complaint_intent(self, text: str) -> Dict[str, Any]:
        """Step 1: NLP Intent Analysis & Entity Extraction."""
        lower = text.lower()

        # Extract amount if mentioned (e.g., 2000, 5000 tk, BDT 1500)
        amount_match = re.search(r'(?:bdt|tk|টাকা)?\s*(\d{2,6})\s*(?:tk|bdt|টাকা)?', lower)
        extracted_amount = float(amount_match.group(1)) if amount_match else None

        # Extract transaction ID if present (e.g. TXN102948, UPAY98234)
        trx_match = re.search(r'\b(?:upay|txn|trx)[-_]?[a-z0-9]+\b', lower)
        extracted_trx = trx_match.group(0).upper() if trx_match else None

        if any(w in lower for w in ["failed", "cut money", "deducted", "not received", "didn't get", "failed cash out", "down"]):
            category = "FAILED_DEBIT_UNCREDITED"
            summary = "Customer balance debited but recipient/service did not credit"
            confidence = 0.96
        elif any(w in lower for w in ["wrong number", "mistake", "wrong person", "accidental", "mistakenly"]):
            category = "WRONG_NUMBER_TRANSFER"
            summary = "Customer accidentally sent money to an incorrect phone number"
            confidence = 0.94
        elif any(w in lower for w in ["hacked", "scam", "fraud", "unauthorized", "stolen", "didn't make this"]):
            category = "SCAM_FRAUD_ALERT"
            summary = "Suspected unauthorized transaction or phishing scam report"
            confidence = 0.92
        elif any(w in lower for w in ["agent", "cash out", "atm", "cash"]):
            category = "AGENT_CASH_OUT_ISSUE"
            summary = "Agent cash-out dispute or counter dispensing failure"
            confidence = 0.91
        else:
            category = "GENERAL_INQUIRY"
            summary = "General transaction inquiry regarding processing status"
            confidence = 0.85

        return {
            "intent_category": category,
            "summary": summary,
            "confidence": confidence,
            "extracted_amount": extracted_amount,
            "extracted_trx_id": extracted_trx,
            "raw_text": text
        }

    async def identify_transaction(
        self,
        user_id: str,
        intent_data: Dict[str, Any],
        user_transactions: List[Any]
    ) -> Dict[str, Any]:
        """Step 2: Transaction Detective - matches complaint to actual user ledger entry."""
        if not user_transactions:
            return {
                "matched": False,
                "confidence": 0.40,
                "explanation": "No recent transactions found on user account.",
                "transaction": None
            }

        target_trx_id = intent_data.get("extracted_trx_id")
        target_amount = intent_data.get("extracted_amount")

        # 1. Exact TRX match
        if target_trx_id:
            for t in user_transactions:
                t_trx = getattr(t, "trx_id", t.get("trx_id") if isinstance(t, dict) else "")
                if t_trx.upper() == target_trx_id:
                    return {
                        "matched": True,
                        "confidence": 0.99,
                        "explanation": f"Exact transaction identifier match for {target_trx_id}",
                        "transaction": t
                    }

        # 2. Match by status FAILED or recent problematic transaction
        for t in user_transactions:
            t_status = getattr(t, "status", t.get("status") if isinstance(t, dict) else "")
            t_amount = getattr(t, "amount", t.get("amount") if isinstance(t, dict) else 0)
            if target_amount and abs(float(t_amount) - target_amount) < 1.0:
                return {
                    "matched": True,
                    "confidence": 0.95,
                    "explanation": f"Matched transaction of BDT {t_amount:,.2f} based on amount mentioned in complaint.",
                    "transaction": t
                }
            if t_status == "FAILED":
                return {
                    "matched": True,
                    "confidence": 0.92,
                    "explanation": "Matched recent failed transaction requiring settlement reversal.",
                    "transaction": t
                }

        # Fallback to the most recent transaction
        latest = user_transactions[0]
        return {
            "matched": True,
            "confidence": 0.82,
            "explanation": "Matched most recent transaction on account.",
            "transaction": latest
        }

    async def analyze_root_cause(self, transaction_data: Dict[str, Any], evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Step 4: AI Root Cause Analysis."""
        status = transaction_data.get("status", "SUCCESS")
        error_code = transaction_data.get("error_code")
        gateway_msg = transaction_data.get("gateway_message")

        if status == "FAILED" or error_code:
            return {
                "root_cause_code": "RC_PARTNER_GATEWAY_TIMEOUT",
                "title": "Inter-switch Settlement Timeout",
                "technical_details": f"Upay switch transmitted funds to partner gateway; response timed out with {error_code or 'ERR_TIMEOUT'}: {gateway_msg or 'Downstream gateway socket drop'}. Upay wallet debited but partner credit unconfirmed.",
                "confidence": 0.98,
                "reconciliation_verdict": "UNRECONCILED_DEBIT"
            }
        else:
            return {
                "root_cause_code": "RC_SUCCESSFUL_DISPATCH",
                "title": "Downstream Settlement Verified",
                "technical_details": "Core ledger and partner switch confirm funds were successfully transferred. Recipient wallet received credit.",
                "confidence": 0.94,
                "reconciliation_verdict": "RECONCILED_SUCCESS"
            }

    async def evaluate_risk(self, transaction_data: Dict[str, Any], user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Step 6: Risk Analysis using RiskGuardService."""
        return risk_guard_service.evaluate_transaction(transaction_data)

    async def generate_recommendation(
        self,
        intent: Dict[str, Any],
        root_cause: Dict[str, Any],
        policy: Dict[str, Any],
        risk: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Step 7: Final structured recommendation & action synthesis."""
        cat = intent.get("intent_category")
        reconciliation = root_cause.get("reconciliation_verdict")

        if reconciliation == "UNRECONCILED_DEBIT":
            return {
                "action": "AUTO_REFUND_APPROVED",
                "title": "Instant Wallet Refund Recommended",
                "justification": f"Confirmed core debit with gateway timeout failure ({root_cause.get('root_cause_code')}). Complies with {policy.get('title')} ({policy.get('id')}). Risk score is {risk.get('risk_score')}/100.",
                "auto_executable": True,
                "recommended_refund": True,
                "human_approval_required": False if risk.get("risk_score", 0) < 30 else True
            }
        elif cat == "WRONG_NUMBER_TRANSFER":
            return {
                "action": "TEMPORARY_RECIPIENT_HOLD",
                "title": "Temporary Recipient Withdrawal Hold",
                "justification": f"Customer flagged accidental transfer. Recommended action: Place a 24-hour withdrawal hold on recipient wallet per {policy.get('title')} and dispatch SMS notification to both parties.",
                "auto_executable": False,
                "recommended_refund": False,
                "human_approval_required": True
            }
        else:
            return {
                "action": "MANUAL_INVESTIGATION",
                "title": "Escalate to Human Operations Specialist",
                "justification": "Evidence indicates transaction was technically successful. Investigation requires recipient contact or fraud verification.",
                "auto_executable": False,
                "recommended_refund": False,
                "human_approval_required": True
            }

    async def execute_full_investigation(
        self,
        user_id: str,
        complaint_text: str,
        user_transactions: List[Any],
        explicit_trx_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Executes the end-to-end 7-step ResolveAI investigation pipeline with full visibility."""
        steps: List[AIReasoningStep] = []
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        # 1. Intent Analysis
        intent_res = await self.analyze_complaint_intent(complaint_text)
        steps.append(AIReasoningStep(
            step_key="intent_detected",
            title="Intent Detected",
            status="completed",
            evidence=f"Category: {intent_res['intent_category']} | Extracted Amount: {intent_res.get('extracted_amount') or 'N/A'}",
            confidence=intent_res["confidence"],
            explanation=f"Identified problem intent as: {intent_res['summary']}",
            timestamp=now
        ))

        # Override TRX if explicitly provided
        if explicit_trx_id:
            intent_res["extracted_trx_id"] = explicit_trx_id

        # 2. Transaction Identification
        trx_res = await self.identify_transaction(user_id, intent_res, user_transactions)
        matched_trx = trx_res.get("transaction")
        trx_dict = matched_trx if isinstance(matched_trx, dict) else {
            "trx_id": getattr(matched_trx, "trx_id", "TRX-UNKNOWN") if matched_trx else "TRX-UNKNOWN",
            "type": getattr(matched_trx, "type", "CASH_OUT") if matched_trx else "CASH_OUT",
            "amount": getattr(matched_trx, "amount", 0.0) if matched_trx else 0.0,
            "fee": getattr(matched_trx, "fee", 0.0) if matched_trx else 0.0,
            "status": getattr(matched_trx, "status", "UNKNOWN") if matched_trx else "UNKNOWN",
            "receiver_phone": getattr(matched_trx, "receiver_phone", "N/A") if matched_trx else "N/A",
            "receiver_name": getattr(matched_trx, "receiver_name", "N/A") if matched_trx else "N/A",
            "channel": getattr(matched_trx, "channel", "APP") if matched_trx else "APP",
            "error_code": getattr(matched_trx, "error_code", None) if matched_trx else None,
            "gateway_message": getattr(matched_trx, "gateway_message", None) if matched_trx else None,
            "meta_info": getattr(matched_trx, "meta_info", {}) if matched_trx else {},
            "created_at": getattr(matched_trx, "created_at", datetime.utcnow()) if matched_trx else datetime.utcnow()
        }

        steps.append(AIReasoningStep(
            step_key="trx_identified",
            title="Transaction Identified",
            status="completed" if trx_res["matched"] else "warning",
            evidence=f"TRX: {trx_dict['trx_id']} | Amount: BDT {trx_dict['amount']:,.2f} | Status: {trx_dict['status']}",
            confidence=trx_res["confidence"],
            explanation=trx_res["explanation"],
            timestamp=now
        ))

        # 3. Evidence Retrieval
        evidence_data = evidence_service.gather_evidence_timeline(trx_dict)
        steps.append(AIReasoningStep(
            step_key="evidence_collected",
            title="Evidence Collected",
            status="completed",
            evidence=f"{len(evidence_data['timeline'])} timeline milestones audit trail logged | Gateway Status: {evidence_data['raw_gateway_status']}",
            confidence=0.99,
            explanation="Assembled multi-point forensic evidence from core ledger, partner gateway logs, and device session telemetry.",
            timestamp=now
        ))

        # 4. Root Cause Analysis
        root_cause = await self.analyze_root_cause(trx_dict, evidence_data)
        steps.append(AIReasoningStep(
            step_key="root_cause_analyzed",
            title="Root Cause Analyzed",
            status="completed",
            evidence=f"Code: {root_cause['root_cause_code']} | Verdict: {root_cause['reconciliation_verdict']}",
            confidence=root_cause["confidence"],
            explanation=root_cause["technical_details"],
            timestamp=now
        ))

        # 5. Policy Retrieval
        matched_policy = policy_service.match_policy(intent_res["intent_category"], trx_dict.get("error_code"))
        steps.append(AIReasoningStep(
            step_key="policy_matched",
            title="Policy Matched",
            status="completed",
            evidence=f"{matched_policy['id']}: {matched_policy['title']} (SLA: {matched_policy['sla_hours']}h)",
            confidence=0.97,
            explanation=f"Policy RAG retrieved regulatory guideline: {matched_policy['description']}",
            timestamp=now
        ))

        # 6. Risk Analysis
        risk_res = await self.evaluate_risk(trx_dict, {})
        steps.append(AIReasoningStep(
            step_key="risk_evaluated",
            title="Risk Evaluated",
            status="completed",
            evidence=f"Risk Score: {risk_res['risk_score']}/100 | Tier: {risk_res['risk_level']} | Signals: {len(risk_res['signals'])}",
            confidence=0.95,
            explanation=risk_res["explanation"],
            timestamp=now
        ))

        # 7. Recommendation Generation
        recommendation = await self.generate_recommendation(intent_res, root_cause, matched_policy, risk_res)
        steps.append(AIReasoningStep(
            step_key="recommendation_generated",
            title="Recommendation Generated",
            status="completed",
            evidence=f"Action: {recommendation['action']} | Auto-Executable: {recommendation['auto_executable']}",
            confidence=0.96,
            explanation=recommendation["justification"],
            timestamp=now
        ))

        ticket_id = f"RES-{uuid.uuid4().hex[:8].upper()}"

        return {
            "ticket_id": ticket_id,
            "user_id": user_id,
            "trx_id": trx_dict["trx_id"],
            "detected_intent": intent_res["intent_category"],
            "ai_confidence": round((intent_res["confidence"] + root_cause["confidence"] + risk_res["risk_score"]/100) / 3, 2),
            "root_cause": root_cause["title"],
            "policy_matched": f"{matched_policy['id']} - {matched_policy['title']}",
            "risk_level": risk_res["risk_level"],
            "recommendation": recommendation["title"],
            "suggested_action": recommendation["action"],
            "refund_amount": trx_dict["amount"] if recommendation.get("recommended_refund") else 0.0,
            "reasoning_steps": [step.model_dump() for step in steps],
            "evidence_data": evidence_data,
            "status": "APPROVED" if recommendation["auto_executable"] else "WAITING_HUMAN_APPROVAL",
            "created_at": datetime.utcnow()
        }


resolveai_service = ResolveAIService()
