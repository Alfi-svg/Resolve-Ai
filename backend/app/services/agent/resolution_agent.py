import logging
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.support_case import SupportCase
from app.models.ai_investigation import AIInvestigation
from app.models.audit_log import AuditLog

logger = logging.getLogger("upay_resolveai.agent.resolution_agent")


class ResolutionAgent:
    """
    Autonomous Case Synthesis and Recommendation Engine.
    STRICT GOVERNANCE:
    The AI Agent recommends actions and compiles full forensic evidence,
    but NEVER directly approves or mutates customer financial balance.
    All financial remediations require explicit human officer approval.
    """

    HERO_CASE_ID = "RES-2026-00182"

    @classmethod
    async def create_or_route_case(
        cls,
        transaction: Dict[str, Any],
        detection: Dict[str, Any],
        reasoning: Dict[str, Any],
        evidence: Dict[str, Any],
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Creates an administrative support case and AI investigation record.
        Enforces human approval boundary.
        """
        txn_id = transaction.get("id", "TXN-8F31A2")
        user_id = transaction.get("user_id", "USR-001")
        amount = float(transaction.get("amount", 2000.0))

        # Assign Hero Case ID for TXN-8F31A2 or generate a systematic ID
        case_id = cls.HERO_CASE_ID if txn_id == "TXN-8F31A2" else f"RES-{datetime.datetime.utcnow().strftime('%Y')}-{txn_id[-5:]}"

        issue_type = detection.get("issue_type", "WALLET_DEBITED_MERCHANT_NOT_CREDITED")
        priority = detection.get("severity", "HIGH")
        recommendation = reasoning.get("recommended_action", "INITIATE_RECONCILIATION")
        risk_score = float(reasoning.get("risk_score", 18.0))
        risk_level = reasoning.get("risk_level", "LOW")

        case_obj = {
            "case_id": case_id,
            "transaction_id": txn_id,
            "user_id": user_id,
            "issue": issue_type,
            "priority": priority,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "root_cause": reasoning.get("root_cause_title", "Gateway Confirmation Timeout"),
            "recommendation": recommendation,
            "human_approval": "REQUIRED",
            "status": "WAITING_FOR_APPROVAL",
            "auto_detected": True,
            "detection_source": "Autonomous ResolveAI Event Stream",
            "summary": reasoning.get("ai_summary"),
            "policy_matched": reasoning.get("policy", {}).get("policy_id", "POL-QR-001"),
            "evidence_count": evidence.get("total_evidence_points", 6),
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }

        # If database session is present, persist or update SupportCase & AIInvestigation
        if db:
            try:
                # Check if case already exists
                res = await db.execute(select(SupportCase).where(SupportCase.id == case_id))
                existing_case = res.scalar_one_or_none()

                if not existing_case:
                    new_case = SupportCase(
                        id=case_id,
                        user_id=user_id,
                        transaction_id=txn_id,
                        complaint=f"[AUTO-DETECTED] {issue_type}: {reasoning.get('root_cause_title')}",
                        status="WAITING_FOR_APPROVAL",
                        priority=priority,
                        risk_score=risk_score,
                        assigned_admin="ADM-OPS-UNASSIGNED"
                    )
                    db.add(new_case)
                    await db.flush()

                # AI Investigation record
                inv_id = f"INV-{txn_id.replace('TXN-', '')}"
                inv_res = await db.execute(select(AIInvestigation).where(AIInvestigation.id == inv_id))
                existing_inv = inv_res.scalar_one_or_none()

                if not existing_inv:
                    new_inv = AIInvestigation(
                        id=inv_id,
                        case_id=case_id,
                        intent=issue_type,
                        transaction_id=txn_id,
                        root_cause=reasoning.get("root_cause_title", "Gateway Confirmation Timeout"),
                        confidence=float(reasoning.get("confidence", 0.98)),
                        risk_score=risk_score,
                        recommendation=recommendation,
                        status="NEEDS_APPROVAL"
                    )
                    db.add(new_inv)
                    await db.flush()

                # Audit Log for AI agent action
                audit = AuditLog(
                    id=f"AUD-AI-{datetime.datetime.utcnow().strftime('%H%M%S%f')[:10]}",
                    admin_id="AI_AGENT_AUTONOMOUS",
                    case_id=case_id,
                    action="AGENT_ANOMALY_DETECTED",
                    actor="ResolveAI Autonomous Agent",
                    target_type="CASE",
                    target_id=case_id,
                    details=f"Agent detected {issue_type} on {txn_id}. Recommended {recommendation}. Pending human approval.",
                    reason="Automated event correlation and gateway timeout detection",
                    previous_status="NONE",
                    new_status="WAITING_FOR_APPROVAL",
                    timestamp=datetime.datetime.utcnow(),
                    log_metadata={"risk_score": risk_score, "evidence_count": evidence.get("total_evidence_points", 6)}
                )
                db.add(audit)
                await db.commit()

            except Exception as e:
                logger.error(f"Error persisting agent case to DB: {e}")
                await db.rollback()

        return case_obj


resolution_agent = ResolutionAgent()
