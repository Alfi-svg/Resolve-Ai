from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.schemas.resolveai import ResolveAIRequest, ResolveAIApprovalRequest
from app.schemas.investigation import FinalInvestigationObject
from app.services.resolveai.investigation_orchestrator import investigation_orchestrator
from app.models.support_case import SupportCase
from app.models.ai_investigation import AIInvestigation

router = APIRouter()


@router.post("/investigate", response_model=FinalInvestigationObject)
async def investigate_complaint(
    payload: ResolveAIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Core ResolveAI Multi-Step Pipeline:
    Complaint -> Intent -> Matcher -> Evidence -> Timeline -> Root Cause -> Policy -> Risk -> Recommendation
    Returns the complete Final Investigation Object.
    """
    final_investigation = await investigation_orchestrator.run_investigation(
        complaint_text=payload.text,
        user_id=payload.user_id or "USR-ALFI-01",
        explicit_txn_id=payload.trx_id,
        db=db
    )
    return final_investigation


import uuid
import datetime
from app.models.audit_log import AuditLog
from app.models.transaction import Transaction
from app.models.transaction_event import TransactionEvent
from app.models.user import User


@router.post("/approve/{case_id}")
async def approve_resolution(
    case_id: str,
    payload: ResolveAIApprovalRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    HUMAN APPROVAL WORKFLOW:
    Core Trust Principle: AI recommends. Human approves. System executes the approved workflow.
    AI must NOT directly perform irreversible financial actions.

    Workflow:
    AI Recommendation -> Admin Review -> Evidence Verification -> Approve / Reject / Escalate -> Resolution Execution
    """
    case_res = await db.execute(select(SupportCase).where(SupportCase.id == case_id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found")

    admin_id = payload.admin_id or "ADM-OPS-ALFI"
    previous_status = case.status
    action = payload.action.upper()
    now = datetime.datetime.utcnow()

    # Find associated AI Investigation if present
    inv_res = await db.execute(select(AIInvestigation).where(AIInvestigation.case_id == case.id))
    investigation = inv_res.scalar_one_or_none()

    # -------------------------------------------------------------------------
    # ACTION: REJECT
    # Admin can reject AI recommendation. MUST require reason.
    # -------------------------------------------------------------------------
    if action == "REJECT":
        reason = (payload.reason or payload.admin_notes or "").strip()
        if not reason:
            raise HTTPException(
                status_code=400,
                detail="Rejection reason is required. Operations admin must provide justification when rejecting an AI recommendation."
            )
        
        case.status = "REJECTED"
        if investigation:
            investigation.status = "REJECTED"

        log_detail = f"AI recommendation rejected by operations admin ({admin_id}): {reason}"

    # -------------------------------------------------------------------------
    # ACTION: ESCALATE
    # Send case to manual investigation / Tier 2 Forensic Audit Team
    # -------------------------------------------------------------------------
    elif action == "ESCALATE":
        reason = (payload.reason or payload.admin_notes or "Escalated to Tier 2 Forensic Audit Team for manual investigation.").strip()
        case.status = "ESCALATED"
        case.priority = "CRITICAL"
        case.assigned_admin = "ADM-FORENSIC-L2"
        if investigation:
            investigation.status = "ESCALATED"

        log_detail = f"Case {case.id} escalated to Tier 2 Forensic Audit Team: {reason}"

    # -------------------------------------------------------------------------
    # ACTION: APPROVE
    # Human approves -> System executes approved financial workflow
    # -------------------------------------------------------------------------
    elif action == "APPROVE":
        reason = (payload.reason or payload.admin_notes or "Resolution approved by operations lead following evidence verification.").strip()
        case.status = "RESOLVED"
        if investigation:
            investigation.status = "ACTIONED"

        # System executes the approved financial workflow:
        # 1. Update Transaction status to REFUNDED
        # 2. Insert REFUND_COMPLETED event into ledger timeline
        # 3. Credit customer wallet balance
        refund_amount = payload.override_amount or 0.0
        txn_res = await db.execute(select(Transaction).where(Transaction.id == case.transaction_id))
        transaction = txn_res.scalar_one_or_none()
        
        if transaction:
            transaction.status = "REFUNDED"
            if refund_amount <= 0:
                refund_amount = transaction.amount

            # Append irreversible financial event to ledger timeline
            refund_event = TransactionEvent(
                id=f"EVT-REF-{uuid.uuid4().hex[:6].upper()}",
                transaction_id=transaction.id,
                event_type="REFUND_COMPLETED",
                source="UPAY_LEDGER_SYSTEM",
                status="SUCCESS",
                timestamp=now,
                metadata={
                    "case_id": case.id,
                    "approved_by": admin_id,
                    "reason": reason,
                    "refund_amount": refund_amount,
                    "policy_reference": "POL-QR-001",
                    "execution_mode": "HUMAN_AUTHORIZED_LEDGER_REVERSAL",
                    "trust_principle": "AI recommends. Human approves. System executes."
                }
            )
            db.add(refund_event)

            # Credit customer wallet balance
            user_res = await db.execute(select(User).where(User.id == transaction.user_id))
            user = user_res.scalar_one_or_none()
            if user:
                user.wallet_balance += refund_amount

        log_detail = (
            f"Approved automated reconciliation reversal credit of ৳{refund_amount:,.2f} for {case.id} "
            f"(TRX: {case.transaction_id}). Dispatched ledger credit to customer wallet."
        )

    elif action == "REQUEST_EVIDENCE":
        reason = (payload.reason or payload.admin_notes or "Requested additional gateway socket packets and merchant reconciliation batch.").strip()
        case.status = "INVESTIGATING"
        log_detail = f"Requested additional telemetry and gateway packet captures for {case.id}: {reason}"

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action '{payload.action}'. Supported: APPROVE, REJECT, ESCALATE")

    # -------------------------------------------------------------------------
    # AUDIT TRAIL:
    # Every action creates: admin_id, case_id, action, timestamp, reason, previous_status, new_status
    # -------------------------------------------------------------------------
    audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    new_log = AuditLog(
        id=audit_id,
        admin_id=admin_id,
        case_id=case.id,
        action=action,
        actor=f"Human Admin ({admin_id})",
        target_type="CASE",
        target_id=case.id,
        details=log_detail,
        reason=reason,
        previous_status=previous_status,
        new_status=case.status,
        timestamp=now,
        log_metadata={
            "admin_id": admin_id,
            "case_id": case.id,
            "transaction_id": case.transaction_id,
            "action": action,
            "reason": reason,
            "previous_status": previous_status,
            "new_status": case.status,
            "trust_principle": "AI recommends. Human approves. System executes the approved workflow."
        }
    )
    db.add(new_log)

    await db.commit()
    await db.refresh(case)

    return {
        "success": True,
        "admin_id": admin_id,
        "case_id": case.id,
        "action": action,
        "timestamp": now.isoformat(),
        "reason": reason,
        "previous_status": previous_status,
        "new_status": case.status,
        "audit_log_id": audit_id,
        "message": f"Action '{action}' executed successfully under Human Approval governance."
    }


@router.get("/audit-logs")
async def list_audit_logs(db: AsyncSession = Depends(get_db)):
    """Retrieve chronologically ordered system and human audit logs."""
    res = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    return res.scalars().all()
