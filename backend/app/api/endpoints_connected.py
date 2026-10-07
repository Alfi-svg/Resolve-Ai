import uuid
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.db.session import get_db
from app.repositories.synthetic_repo import SyntheticRepository
from app.repositories.base import BaseRepository
from app.models.user import User
from app.models.transaction import Transaction
from app.models.transaction_event import TransactionEvent
from app.models.support_case import SupportCase
from app.models.ai_investigation import AIInvestigation
from app.models.evidence import Evidence
from app.models.audit_log import AuditLog
from app.models.risk_case import RiskCase

from app.schemas.synthetic import (
    UserResponse,
    TransactionResponse,
    TransactionTimelineResponse,
    TransactionEventResponse,
    SupportCaseResponse,
    AIInvestigationResponse,
    EvidenceResponse
)
from app.schemas.investigation import FinalInvestigationObject
from app.schemas.resolveai import ResolveAIRequest
from app.schemas.risk_guard import (
    RiskOverviewStats,
    RiskEvaluationResponse
)
from app.schemas.connected import (
    DemoLoginRequest,
    DemoLoginResponse,
    AdminOverviewResponse,
    ApprovalActionRequest,
    ApprovalResultResponse,
    RiskAnalyzeRequest,
    AnalyticsOverviewResponse,
    DailyTrendPoint
)

from app.services.resolveai.investigation_orchestrator import investigation_orchestrator
from app.services.risk_guard.service import risk_guard_service
from app.services.incident_intelligence.service import incident_service

router = APIRouter()


def normalize_user_id(uid: Optional[str]) -> str:
    if not uid or uid in ["USR-ALFI-01", "USR-001", "CURRENT_USER"]:
        return "USR-001"
    if uid in ["ADM-OPS-ALFI", "ADM-001"]:
        return "ADM-001"
    return uid


# ===========================================================================
# 1. AUTH DEMO
# ===========================================================================
@router.post("/auth/demo-login", response_model=DemoLoginResponse)
async def demo_login(
    payload: DemoLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulated OAuth / JWT Login endpoint for Upay ResolveAI.
    Permits seamless toggling between Customer User and Operations Admin personas.
    """
    raw_id = payload.user_id or ("ADM-001" if payload.role.upper() == "ADMIN" else "USR-001")
    user_id = normalize_user_id(raw_id)
    
    # Fetch matching user or fallback to first user
    res = await db.execute(select(User).where((User.id == user_id) | (User.id == raw_id)))
    user = res.scalar_one_or_none()
    
    if not user:
        all_users_res = await db.execute(select(User).limit(1))
        user = all_users_res.scalar_one_or_none()

    if not user:
        user = User(
            id=user_id,
            name="Alfi Rahman" if payload.role.upper() == "USER" else "Operations Sentinel (Alfi)",
            phone_masked="+880 1712-***678",
            account_status="ACTIVE",
            wallet_balance=14500.0,
            risk_level="LOW",
            created_at=datetime.datetime.utcnow()
        )
        db.add(user)
        await db.commit()

    role = payload.role.upper()
    token = f"upay-token-{role.lower()}-{uuid.uuid4().hex[:12]}"
    permissions = (
        ["ADMIN_DASHBOARD", "INVESTIGATE_CASES", "APPROVE_RESOLUTIONS", "REROUTE_GATEWAY", "AUDIT_LOGS"]
        if role == "ADMIN"
        else ["VIEW_BALANCE", "MAKE_PAYMENT", "SUBMIT_COMPLAINT", "VIEW_TRANSACTIONS", "SPLIT_PAYMENT"]
    )
    expires = (datetime.datetime.utcnow() + datetime.timedelta(hours=12)).isoformat() + "Z"

    return DemoLoginResponse(
        success=True,
        token=token,
        role=role,
        user=UserResponse.model_validate(user),
        permissions=permissions,
        session_expires_at=expires
    )


# ===========================================================================
# 2. USER ENDPOINTS
# ===========================================================================
@router.get("/user/profile", response_model=UserResponse)
async def get_user_profile(
    user_id: Optional[str] = Query(None, description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve profile and current wallet balance for the authenticated user."""
    target_id = normalize_user_id(user_id)
    res = await db.execute(select(User).where((User.id == target_id) | (User.id == user_id)))
    user = res.scalar_one_or_none()
    if not user:
        fallback = await db.execute(select(User).limit(1))
        user = fallback.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user


@router.get("/user/transactions", response_model=List[TransactionResponse])
async def get_user_transactions(
    user_id: Optional[str] = Query(None, description="User ID"),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve personal ledger transactions for the authenticated mobile wallet user."""
    target_id = normalize_user_id(user_id)
    repo = SyntheticRepository(db)
    txns = await repo.get_transactions(user_id=target_id, limit=limit)
    if not txns and user_id and user_id != target_id:
        txns = await repo.get_transactions(user_id=user_id, limit=limit)
    if not txns:
        # Fallback to recent transactions
        txns = await repo.get_transactions(limit=limit)
    return txns


@router.get("/user/cases", response_model=List[SupportCaseResponse])
async def get_user_cases(
    user_id: Optional[str] = Query(None, description="User ID"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all dispute and ResolveAI support cases filed by this user."""
    target_id = normalize_user_id(user_id)
    repo = SyntheticRepository(db)
    cases = await repo.get_cases(user_id=target_id)
    if not cases:
        cases = await repo.get_cases()
    
    results = []
    for c in cases:
        case_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "transaction_id": c.transaction_id,
            "complaint": c.complaint,
            "status": c.status,
            "priority": c.priority,
            "risk_score": c.risk_score,
            "assigned_admin": c.assigned_admin,
            "created_at": c.created_at,
            "investigation": None
        }
        inv = await repo.get_investigation_for_case(c.id)
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)
            case_dict["investigation"] = {
                "id": inv.id,
                "case_id": inv.case_id,
                "intent": inv.intent,
                "transaction_id": inv.transaction_id,
                "root_cause": inv.root_cause,
                "confidence": inv.confidence,
                "risk_score": inv.risk_score,
                "recommendation": inv.recommendation,
                "status": inv.status,
                "evidences": [EvidenceResponse.model_validate(e) for e in evidences]
            }
        results.append(SupportCaseResponse(**case_dict))
    return results


# ===========================================================================
# 3. RESOLVEAI ENDPOINTS
# ===========================================================================
@router.post("/resolveai/analyze", response_model=FinalInvestigationObject)
async def analyze_complaint(
    payload: ResolveAIRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Primary ResolveAI Investigation Pipeline Endpoint:
    Processes natural language Bengali/Banglish complaints through:
    Complaint -> Intent -> Matcher -> Evidence -> Timeline -> Root Cause -> Policy -> Risk -> Recommendation
    """
    query_text = payload.text
    if not query_text:
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty. Please provide complaint or complaint_text.")
        
    final_investigation = await investigation_orchestrator.run_investigation(
        complaint_text=query_text,
        user_id=payload.user_id or "USR-ALFI-01",
        explicit_txn_id=payload.trx_id,
        db=db
    )
    return final_investigation


@router.get("/resolveai/cases", response_model=List[SupportCaseResponse])
async def list_resolveai_cases(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all ResolveAI investigation cases across the system."""
    repo = SyntheticRepository(db)
    cases = await repo.get_cases(status=status, priority=priority)
    
    results = []
    for c in cases:
        case_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "transaction_id": c.transaction_id,
            "complaint": c.complaint,
            "status": c.status,
            "priority": c.priority,
            "risk_score": c.risk_score,
            "assigned_admin": c.assigned_admin,
            "created_at": c.created_at,
            "investigation": None
        }
        inv = await repo.get_investigation_for_case(c.id)
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)
            case_dict["investigation"] = {
                "id": inv.id,
                "case_id": inv.case_id,
                "intent": inv.intent,
                "transaction_id": inv.transaction_id,
                "root_cause": inv.root_cause,
                "confidence": inv.confidence,
                "risk_score": inv.risk_score,
                "recommendation": inv.recommendation,
                "status": inv.status,
                "evidences": [EvidenceResponse.model_validate(e) for e in evidences]
            }
        results.append(SupportCaseResponse(**case_dict))
    return results


@router.get("/resolveai/cases/{case_id}", response_model=SupportCaseResponse)
async def get_resolveai_case_by_id(
    case_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full ResolveAI case details with nested investigation and evidence."""
    repo = SyntheticRepository(db)
    c = await repo.get_case_by_id(case_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"ResolveAI Case '{case_id}' not found")
        
    inv = await repo.get_investigation_for_case(c.id)
    inv_data = None
    if inv:
        evidences = await repo.get_evidences_for_investigation(inv.id)
        inv_data = {
            "id": inv.id,
            "case_id": inv.case_id,
            "intent": inv.intent,
            "transaction_id": inv.transaction_id,
            "root_cause": inv.root_cause,
            "confidence": inv.confidence,
            "risk_score": inv.risk_score,
            "recommendation": inv.recommendation,
            "status": inv.status,
            "evidences": [EvidenceResponse.model_validate(e) for e in evidences]
        }
        
    return SupportCaseResponse(
        id=c.id,
        user_id=c.user_id,
        transaction_id=c.transaction_id,
        complaint=c.complaint,
        status=c.status,
        priority=c.priority,
        risk_score=c.risk_score,
        assigned_admin=c.assigned_admin,
        created_at=c.created_at,
        investigation=AIInvestigationResponse(**inv_data) if inv_data else None
    )


@router.get("/resolveai/investigations/{id}", response_model=AIInvestigationResponse)
async def get_investigation_by_id(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve AI investigation by investigation ID or associated case ID."""
    res = await db.execute(
        select(AIInvestigation).where((AIInvestigation.id == id) | (AIInvestigation.case_id == id))
    )
    inv = res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found")

    repo = SyntheticRepository(db)
    evidences = await repo.get_evidences_for_investigation(inv.id)
    
    return AIInvestigationResponse(
        id=inv.id,
        case_id=inv.case_id,
        intent=inv.intent,
        transaction_id=inv.transaction_id,
        root_cause=inv.root_cause,
        confidence=inv.confidence,
        risk_score=inv.risk_score,
        recommendation=inv.recommendation,
        status=inv.status,
        evidences=[EvidenceResponse.model_validate(e) for e in evidences]
    )


# ===========================================================================
# 4. EVIDENCE ENDPOINTS
# ===========================================================================
@router.get("/investigations/{id}/evidence", response_model=List[EvidenceResponse])
async def get_investigation_evidence(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all multi-source forensic evidence items collected for an investigation."""
    repo = SyntheticRepository(db)
    evidences = await repo.get_evidences_for_investigation(id)
    
    if not evidences:
        # Check if ID passed was actually a case ID
        inv = await repo.get_investigation_for_case(id)
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)

    if not evidences:
        # Check if ID passed was a transaction ID
        res = await db.execute(select(AIInvestigation).where(AIInvestigation.transaction_id == id))
        inv = res.scalars().first()
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)
            
    if not evidences:
        return []

    return [EvidenceResponse.model_validate(e) for e in evidences]


# ===========================================================================
# 5. RISK ENDPOINTS (Clean /api/risk/... aliases)
# ===========================================================================
@router.get("/risk/overview", response_model=RiskOverviewStats)
async def get_risk_overview(db: AsyncSession = Depends(get_db)):
    """Risk Guard summary metrics: monitored throughput, anomaly counts, distribution."""
    repo = BaseRepository(db)
    cases = await repo.get_risk_cases()
    high_count = sum(1 for c in cases if c.risk_level in ["HIGH", "CRITICAL"] and c.status == "FLAGGED")
    
    return RiskOverviewStats(
        monitored_hourly=12480,
        flagged_anomalies=max(3, high_count),
        systemic_incidents=1,
        model_version="v2.4 FinBERT + Deterministic Rules",
        risk_distribution={"LOW": 11840, "MEDIUM": 612, "HIGH": 28},
        pending_review_count=max(1, high_count)
    )


@router.get("/risk/transactions")
async def get_risk_transactions(
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List monitored transactions with evaluated risk signals."""
    res = await db.execute(select(Transaction).order_by(Transaction.created_at.desc()).limit(limit))
    txns = list(res.scalars().all())

    monitored = []
    for t in txns:
        t_dict = {
            "id": t.id,
            "user_id": t.user_id,
            "merchant_id": t.merchant_id,
            "amount": t.amount,
            "type": t.type,
            "channel": t.channel,
            "device_id": t.device_id,
            "location": t.location,
            "created_at": t.created_at.isoformat() if hasattr(t.created_at, "isoformat") else str(t.created_at),
            "status": t.status
        }
        eval_res = risk_guard_service.evaluate_transaction(t_dict)
        monitored.append({
            "id": t.id,
            "user_id": t.user_id,
            "merchant_id": t.merchant_id,
            "amount": t.amount,
            "type": t.type,
            "channel": t.channel,
            "device_id": t.device_id,
            "location": t.location,
            "created_at": t.created_at.isoformat() if hasattr(t.created_at, "isoformat") else str(t.created_at),
            "status": t.status,
            "risk_score": eval_res.get("risk_score", 15),
            "risk_level": eval_res.get("risk_level", "LOW"),
            "risk_level_label": eval_res.get("risk_level_label", "Low Risk"),
            "badge_color": eval_res.get("badge_color", "emerald"),
            "signals_count": eval_res.get("signals_count", 0),
            "primary_signal": (eval_res.get("signals") or [{}])[0].get("name", "Baseline Activity") if eval_res.get("signals") else "Baseline Activity",
            "recommended_action": eval_res.get("recommendation", {}).get("primary_recommendation", "Approve standard processing"),
            "fraud_patterns_count": eval_res.get("fraud_patterns_count", 0),
            "is_ato_suspected": eval_res.get("account_takeover", {}).get("is_ato_suspected", False)
        })
    return monitored


@router.get("/risk/transactions/{id}")
async def get_risk_transaction_detail(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full risk assessment dossier with behavioral signals for a transaction."""
    res = await db.execute(select(Transaction).where(Transaction.id == id))
    t = res.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail=f"Transaction '{id}' not found")
    t_dict = {
        "id": t.id,
        "user_id": t.user_id,
        "merchant_id": t.merchant_id,
        "amount": t.amount,
        "type": t.type,
        "channel": t.channel,
        "device_id": t.device_id,
        "location": t.location,
        "created_at": t.created_at.isoformat() if hasattr(t.created_at, "isoformat") else str(t.created_at),
        "status": t.status
    }
    return risk_guard_service.evaluate_transaction(t_dict)


@router.post("/risk/analyze")
async def analyze_risk(
    payload: RiskAnalyzeRequest,
    db: AsyncSession = Depends(get_db)
):
    """On-demand transaction risk evaluation endpoint."""
    res = await db.execute(select(Transaction).where(Transaction.id == payload.transaction_id))
    t = res.scalar_one_or_none()
    if not t:
        raise HTTPException(status_code=404, detail=f"Transaction '{payload.transaction_id}' not found")
    t_dict = {
        "id": t.id,
        "user_id": t.user_id,
        "merchant_id": t.merchant_id,
        "amount": t.amount,
        "type": t.type,
        "channel": t.channel,
        "device_id": t.device_id,
        "location": t.location,
        "created_at": t.created_at.isoformat() if hasattr(t.created_at, "isoformat") else str(t.created_at),
        "status": t.status
    }
    return risk_guard_service.evaluate_transaction(t_dict)


# ===========================================================================
# 6. ADMIN INTELLIGENCE ENDPOINTS
# ===========================================================================
@router.get("/admin/overview", response_model=AdminOverviewResponse)
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    """
    High-level operational metrics for the Admin Investigation Command Center:
    Active Cases, AI Investigations, Pending Approvals, High Risk Txns, Outages.
    """
    cases_res = await db.execute(select(SupportCase))
    all_cases = list(cases_res.scalars().all())
    
    active_cases = len([c for c in all_cases if c.status not in ["RESOLVED", "REJECTED"]])
    pending_approvals = len([c for c in all_cases if c.status in ["WAITING_APPROVAL", "PENDING_APPROVAL", "INVESTIGATING", "OPEN"]])
    resolved_cases = len([c for c in all_cases if c.status == "RESOLVED"])
    
    inv_res = await db.execute(select(AIInvestigation))
    all_invs = list(inv_res.scalars().all())
    
    risk_res = await db.execute(select(RiskCase))
    high_risks = len([r for r in risk_res.scalars().all() if r.risk_level in ["HIGH", "CRITICAL"]])

    incidents = await incident_service.list_incidents(db)
    open_incidents = len([inc for inc in incidents if inc.get("status") != "RESOLVED"])

    total_cases = len(all_cases) or 1
    res_rate = round((resolved_cases / total_cases) * 100, 1) if total_cases > 0 else 92.5

    return AdminOverviewResponse(
        active_cases=max(1, active_cases),
        ai_investigations_count=max(1, len(all_invs)),
        pending_approvals_count=max(1, pending_approvals),
        high_risk_transactions_count=max(1, high_risks),
        open_incidents_count=max(1, open_incidents),
        resolution_rate_percent=res_rate,
        avg_resolution_time_seconds=78,
        total_volume_bdt=1845000.0,
        system_health_status="OPERATIONAL"
    )


@router.get("/admin/cases", response_model=List[SupportCaseResponse])
async def get_admin_cases(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all support cases formatted for the Admin Case Investigation Workspace."""
    repo = SyntheticRepository(db)
    cases = await repo.get_cases(status=status, priority=priority)
    
    results = []
    for c in cases:
        case_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "transaction_id": c.transaction_id,
            "complaint": c.complaint,
            "status": c.status,
            "priority": c.priority,
            "risk_score": c.risk_score,
            "assigned_admin": c.assigned_admin,
            "created_at": c.created_at,
            "investigation": None
        }
        inv = await repo.get_investigation_for_case(c.id)
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)
            case_dict["investigation"] = {
                "id": inv.id,
                "case_id": inv.case_id,
                "intent": inv.intent,
                "transaction_id": inv.transaction_id,
                "root_cause": inv.root_cause,
                "confidence": inv.confidence,
                "risk_score": inv.risk_score,
                "recommendation": inv.recommendation,
                "status": inv.status,
                "evidences": [EvidenceResponse.model_validate(e) for e in evidences]
            }
        results.append(SupportCaseResponse(**case_dict))
    return results


@router.get("/admin/pending-approvals", response_model=List[SupportCaseResponse])
async def get_admin_pending_approvals(db: AsyncSession = Depends(get_db)):
    """Retrieve only cases awaiting Human Approval in the Resolution Queue."""
    repo = SyntheticRepository(db)
    all_cases = await repo.get_cases()
    pending = [c for c in all_cases if c.status in ["WAITING_APPROVAL", "PENDING_APPROVAL", "INVESTIGATING", "OPEN"]]
    
    results = []
    for c in pending:
        case_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "transaction_id": c.transaction_id,
            "complaint": c.complaint,
            "status": c.status,
            "priority": c.priority,
            "risk_score": c.risk_score,
            "assigned_admin": c.assigned_admin,
            "created_at": c.created_at,
            "investigation": None
        }
        inv = await repo.get_investigation_for_case(c.id)
        if inv:
            evidences = await repo.get_evidences_for_investigation(inv.id)
            case_dict["investigation"] = {
                "id": inv.id,
                "case_id": inv.case_id,
                "intent": inv.intent,
                "transaction_id": inv.transaction_id,
                "root_cause": inv.root_cause,
                "confidence": inv.confidence,
                "risk_score": inv.risk_score,
                "recommendation": inv.recommendation,
                "status": inv.status,
                "evidences": [EvidenceResponse.model_validate(e) for e in evidences]
            }
        results.append(SupportCaseResponse(**case_dict))
    return results


# ===========================================================================
# 7. APPROVAL WORKFLOW ENDPOINTS (POST /api/cases/{id}/...)
# ===========================================================================
@router.post("/cases/{id}/approve", response_model=ApprovalResultResponse)
async def approve_case(
    id: str,
    payload: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    HUMAN APPROVAL: APPROVE
    Executes refund/reversal workflow, credits customer wallet, and records immutable audit log.
    """
    case_res = await db.execute(select(SupportCase).where(SupportCase.id == id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{id}' not found")

    previous_status = case.status
    now = datetime.datetime.utcnow()
    admin_id = payload.admin_id or "ADM-OPS-ALFI"
    reason = payload.reason or payload.admin_notes or "Approved based on verified root cause and policy POL-QR-001."

    # Update case status
    case.status = "RESOLVED"
    
    # Update investigation if linked
    inv_res = await db.execute(select(AIInvestigation).where(AIInvestigation.case_id == case.id))
    investigation = inv_res.scalar_one_or_none()
    if investigation:
        investigation.status = "APPROVED"

    # Fetch transaction to credit wallet
    txn_res = await db.execute(select(Transaction).where(Transaction.id == case.transaction_id))
    txn = txn_res.scalar_one_or_none()
    
    refund_amount = payload.refund_amount or (txn.amount if txn else 2000.0)
    
    if txn:
        txn.status = "RESOLVED"
        # Credit user wallet
        user_res = await db.execute(select(User).where(User.id == case.user_id))
        user = user_res.scalar_one_or_none()
        if user:
            user.wallet_balance += refund_amount

        # Add reversal event
        rev_event = TransactionEvent(
            id=f"EVT-REV-{uuid.uuid4().hex[:6].upper()}",
            transaction_id=txn.id,
            event_type="REVERSAL_COMPLETED",
            source="SETTLEMENT_CORE",
            timestamp=now,
            status="SUCCESS",
            metadata={"approved_by": admin_id, "amount_refunded": refund_amount}
        )
        db.add(rev_event)

    # Record Audit Log
    audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    audit_log = AuditLog(
        id=audit_id,
        admin_id=admin_id,
        case_id=case.id,
        action="APPROVE_RESOLUTION",
        actor="Operations Admin",
        target_type="CASE",
        target_id=case.id,
        details=f"Human admin {admin_id} approved AI resolution. Refund of ৳{refund_amount:,.2f} executed.",
        reason=reason,
        previous_status=previous_status,
        new_status="RESOLVED",
        timestamp=now,
        log_metadata={"refund_amount": refund_amount, "case_id": case.id}
    )
    db.add(audit_log)
    await db.commit()

    return ApprovalResultResponse(
        success=True,
        case_id=case.id,
        action="APPROVE",
        previous_status=previous_status,
        new_status="RESOLVED",
        reason=reason,
        audit_id=audit_id,
        timestamp=now.isoformat() + "Z",
        details=f"Refund of ৳{refund_amount:,.2f} credited to customer wallet under policy POL-QR-001."
    )


@router.post("/cases/{id}/reject", response_model=ApprovalResultResponse)
async def reject_case(
    id: str,
    payload: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    HUMAN APPROVAL: REJECT
    Requires mandatory rejection reason. Case closed as rejected.
    """
    reason = (payload.reason or payload.admin_notes or "").strip()
    if not reason:
        raise HTTPException(
            status_code=400,
            detail="Rejection reason is required. Operations admin must provide justification when rejecting an AI recommendation."
        )

    case_res = await db.execute(select(SupportCase).where(SupportCase.id == id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{id}' not found")

    previous_status = case.status
    now = datetime.datetime.utcnow()
    admin_id = payload.admin_id or "ADM-OPS-ALFI"

    case.status = "REJECTED"
    inv_res = await db.execute(select(AIInvestigation).where(AIInvestigation.case_id == case.id))
    investigation = inv_res.scalar_one_or_none()
    if investigation:
        investigation.status = "REJECTED"

    audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    audit_log = AuditLog(
        id=audit_id,
        admin_id=admin_id,
        case_id=case.id,
        action="REJECT_RESOLUTION",
        actor="Operations Admin",
        target_type="CASE",
        target_id=case.id,
        details=f"AI recommendation rejected by operations admin {admin_id}.",
        reason=reason,
        previous_status=previous_status,
        new_status="REJECTED",
        timestamp=now,
        log_metadata={"case_id": case.id}
    )
    db.add(audit_log)
    await db.commit()

    return ApprovalResultResponse(
        success=True,
        case_id=case.id,
        action="REJECT",
        previous_status=previous_status,
        new_status="REJECTED",
        reason=reason,
        audit_id=audit_id,
        timestamp=now.isoformat() + "Z",
        details=f"Case rejected with reason: {reason}"
    )


@router.post("/cases/{id}/escalate", response_model=ApprovalResultResponse)
async def escalate_case(
    id: str,
    payload: ApprovalActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    HUMAN APPROVAL: ESCALATE
    Sends case to Tier 2 Forensic Audit Team for manual investigation.
    """
    case_res = await db.execute(select(SupportCase).where(SupportCase.id == id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail=f"Case '{id}' not found")

    previous_status = case.status
    now = datetime.datetime.utcnow()
    admin_id = payload.admin_id or "ADM-OPS-ALFI"
    reason = payload.reason or payload.admin_notes or "Escalated to Tier 2 Forensic Audit Team for manual investigation."

    case.status = "ESCALATED"
    case.priority = "CRITICAL"
    case.assigned_admin = "ADM-FORENSIC-L2"

    inv_res = await db.execute(select(AIInvestigation).where(AIInvestigation.case_id == case.id))
    investigation = inv_res.scalar_one_or_none()
    if investigation:
        investigation.status = "ESCALATED"

    audit_id = f"AUD-{uuid.uuid4().hex[:6].upper()}"
    audit_log = AuditLog(
        id=audit_id,
        admin_id=admin_id,
        case_id=case.id,
        action="ESCALATE_CASE",
        actor="Operations Admin",
        target_type="CASE",
        target_id=case.id,
        details=f"Case escalated to manual forensic investigation queue.",
        reason=reason,
        previous_status=previous_status,
        new_status="ESCALATED",
        timestamp=now,
        log_metadata={"case_id": case.id}
    )
    db.add(audit_log)
    await db.commit()

    return ApprovalResultResponse(
        success=True,
        case_id=case.id,
        action="ESCALATE",
        previous_status=previous_status,
        new_status="ESCALATED",
        reason=reason,
        audit_id=audit_id,
        timestamp=now.isoformat() + "Z",
        details="Case reassigned to Tier 2 Forensic Audit Team."
    )


# ===========================================================================
# 8. ANALYTICS ENDPOINTS
# ===========================================================================
@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Operational analytics: resolution rates, speed metrics, intent breakdown, and trends."""
    cases_res = await db.execute(select(SupportCase))
    all_cases = list(cases_res.scalars().all())

    resolved = len([c for c in all_cases if c.status == "RESOLVED"])
    rejected = len([c for c in all_cases if c.status == "REJECTED"])
    escalated = len([c for c in all_cases if c.status == "ESCALATED"])
    total = len(all_cases) or 1

    rate = round((resolved / total) * 100, 1)

    today = datetime.date.today()
    trends = [
        DailyTrendPoint(
            date=(today - datetime.timedelta(days=i)).strftime("%b %d"),
            cases_opened=12 + i * 3,
            auto_resolved=9 + i * 2,
            human_approved=2 + i,
            volume_bdt=(12 + i * 3) * 1850.0
        )
        for i in range(6, -1, -1)
    ]

    return AnalyticsOverviewResponse(
        resolution_rate=rate,
        avg_resolution_seconds=78,
        total_cases_analyzed=total,
        auto_resolved_count=max(1, resolved - 1),
        human_approved_count=1,
        rejected_count=rejected,
        escalated_count=escalated,
        total_refunded_bdt=resolved * 2000.0,
        channel_distribution={
            "Bangla QR": 64,
            "Online Merchant Gateway": 21,
            "Agent Cash Out": 10,
            "P2P Transfer": 5
        },
        intent_distribution={
            "QR_PAYMENT_FAILURE": 48,
            "CASH_OUT_DISPENSER_TIMEOUT": 24,
            "MERCHANT_WEBHOOK_DROPPED": 18,
            "ACCOUNT_TAKEOVER_ALERT": 10
        },
        daily_trends=trends
    )
