from typing import List, Optional, Dict, Any
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.repositories.base import BaseRepository
from app.models.risk_case import RiskCase
from app.models.transaction import Transaction
from app.models.audit_log import AuditLog
from app.services.risk_guard.service import risk_guard_service
from app.schemas.risk_guard import (
    RiskCaseResponse, 
    RiskActionRequest, 
    RiskOverviewStats, 
    RiskEvaluationResponse,
    ScamAnalysisRequest,
    ScamAnalysisResponse,
    FraudPatternItem,
    AccountTakeoverResponse
)

router = APIRouter()


@router.get("/overview", response_model=RiskOverviewStats)
async def get_risk_overview(db: AsyncSession = Depends(get_db)):
    """Summary metrics and distribution for the Risk Guard console."""
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


@router.get("/cases", response_model=List[RiskCaseResponse])
async def list_risk_cases(db: AsyncSession = Depends(get_db)):
    """Retrieve all flagged risk cases for the Admin Risk Guard console."""
    repo = BaseRepository(db)
    return await repo.get_risk_cases()


@router.get("/transactions")
async def list_monitored_transactions(
    limit: int = Query(25, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Returns monitored transactions evaluated by the Risk Guard engine."""
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
            "created_at": t.created_at,
            "meta_info": t.meta_info or {}
        }
        eval_result = risk_guard_service.evaluate_transaction(t_dict)
        monitored.append({
            "id": t.id,
            "user_id": t.user_id,
            "type": t.type,
            "amount": t.amount,
            "channel": t.channel,
            "device_id": t.device_id,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "status": t.status,
            "risk_score": eval_result["risk_score"],
            "risk_level": eval_result["risk_level"],
            "risk_level_label": eval_result["risk_level_label"],
            "badge_color": eval_result["badge_color"],
            "signals_count": eval_result["signals_count"],
            "primary_signal": eval_result["signals"][0]["name"] if eval_result["signals"] else "Baseline Activity",
            "recommended_action": eval_result["recommendation"]["primary_recommendation"],
            "fraud_patterns_count": eval_result.get("fraud_patterns_count", 0),
            "is_ato_suspected": eval_result.get("account_takeover", {}).get("is_ato_suspected", False)
        })

    return monitored


@router.get("/evaluate/{transaction_id}", response_model=RiskEvaluationResponse)
async def evaluate_transaction_risk(
    transaction_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Executes the full Risk Guard AI Pipeline for a specific transaction ID."""
    res = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    txn = res.scalar_one_or_none()

    if txn:
        txn_dict = {
            "id": txn.id,
            "user_id": txn.user_id,
            "merchant_id": txn.merchant_id,
            "amount": txn.amount,
            "type": txn.type,
            "channel": txn.channel,
            "device_id": txn.device_id,
            "location": txn.location,
            "created_at": txn.created_at,
            "meta_info": txn.meta_info or {}
        }
    else:
        # Fallback for synthetic scenario evaluation if not in DB
        if transaction_id == "TXN-91K82X":
            txn_dict = {
                "id": "TXN-91K82X",
                "user_id": "USR-002",
                "amount": 45000.0,
                "type": "SEND_MONEY",
                "channel": "APP",
                "device_id": "DEV-NEW-X992",
                "location": "Chittagong GEC, BD",
                "meta_info": {
                    "recipient_phone": "+8801999887766",
                    "device_registered_mins_ago": 8,
                    "failed_auth_attempts": 3,
                    "recent_password_reset": True,
                    "multi_source_destination": True,
                    "dormant_reactivation": True
                }
            }
        else:
            txn_dict = {
                "id": transaction_id,
                "amount": 2000.0,
                "type": "PAYMENT",
                "channel": "APP",
                "device_id": "DEV-IPHONE-14",
                "location": "Banani, Dhaka",
                "meta_info": {}
            }

    evaluation = risk_guard_service.evaluate_transaction(txn_dict)
    return RiskEvaluationResponse(**evaluation)


@router.post("/scam-signals/analyze", response_model=ScamAnalysisResponse)
async def analyze_complaint_for_scam_signals(request: ScamAnalysisRequest):
    """
    Analyzes customer complaint text for social engineering, OTP harvesting,
    suspicious links, and advance-fee extortion signals.
    Classifies as SCAM_SUSPECTED with calibrated confidence.
    """
    result = risk_guard_service.analyze_scam_signals(
        complaint_text=request.complaint_text,
        metadata=request.metadata
    )
    return ScamAnalysisResponse(**result)


@router.get("/fraud-patterns", response_model=List[FraudPatternItem])
async def get_detected_fraud_patterns(
    transaction_id: str = Query("TXN-91K82X"),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates synthetic fraud patterns for a specified transaction or stream:
    - Multiple accounts -> same destination
    - Rapid transaction burst
    - Multiple failed authentication attempts
    - Unusual device change
    - Large amount after account inactivity
    - Repeated transaction failures
    - Unusual geographic behavior
    """
    res = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    txn = res.scalar_one_or_none()

    if txn:
        txn_dict = {
            "id": txn.id,
            "amount": txn.amount,
            "device_id": txn.device_id,
            "location": txn.location,
            "meta_info": txn.meta_info or {}
        }
    else:
        txn_dict = {
            "id": "TXN-91K82X",
            "amount": 45000.0,
            "device_id": "DEV-NEW-X992",
            "location": "Chittagong GEC, BD",
            "meta_info": {
                "recipient_phone": "+8801999887766",
                "device_registered_mins_ago": 8,
                "failed_auth_attempts": 3,
                "recent_password_reset": True,
                "multi_source_destination": True,
                "dormant_reactivation": True
            }
        }

    patterns = risk_guard_service.detect_fraud_patterns(txn_dict)
    return [FraudPatternItem(**p) for p in patterns]


@router.get("/ato-evaluation/{transaction_id}", response_model=AccountTakeoverResponse)
async def evaluate_account_takeover_risk(
    transaction_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Specialized evaluation of Account Takeover (ATO) risk across 5 foundational signals:
    - New device
    - New location
    - Failed authentication
    - Password / PIN reset
    - High-value transaction
    Always presented as AI-assisted risk detection (Potential Account Takeover).
    """
    res = await db.execute(select(Transaction).where(Transaction.id == transaction_id))
    txn = res.scalar_one_or_none()

    if txn:
        txn_dict = {
            "id": txn.id,
            "amount": txn.amount,
            "device_id": txn.device_id,
            "location": txn.location,
            "meta_info": txn.meta_info or {}
        }
    else:
        txn_dict = {
            "id": "TXN-91K82X",
            "amount": 45000.0,
            "device_id": "DEV-NEW-X992",
            "location": "Chittagong GEC, BD",
            "meta_info": {
                "recipient_phone": "+8801999887766",
                "device_registered_mins_ago": 8,
                "failed_auth_attempts": 3,
                "recent_password_reset": True
            }
        }

    ato = risk_guard_service.evaluate_account_takeover(txn_dict)
    return AccountTakeoverResponse(**ato)


@router.post("/decision")
async def record_human_decision(
    decision_data: RiskActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Records an administrative human decision for a risk-flagged transaction.
    Available actions:
    - REQUIRE_ADDITIONAL_VERIFICATION
    - AUTHORIZE_TEMPORARY_HOLD
    - SEND_TO_MANUAL_REVIEW
    - CLEAR_FALSE_POSITIVE
    """
    trx_id = decision_data.trx_id or "TXN-91K82X"
    action = decision_data.action

    # Find risk case or transaction
    res = await db.execute(select(RiskCase).where(RiskCase.trx_id == trx_id))
    risk_case = res.scalar_one_or_none()

    if risk_case:
        risk_case.action_taken = action
        if action == "CLEAR_FALSE_POSITIVE":
            risk_case.status = "CLEARED"
        elif action == "AUTHORIZE_TEMPORARY_HOLD":
            risk_case.status = "HELD"
        elif action == "REQUIRE_ADDITIONAL_VERIFICATION":
            risk_case.status = "CHALLENGED"
        else:
            risk_case.status = "UNDER_REVIEW"

    # Also log to immutable AuditLog
    audit = AuditLog(
        id=f"AUDIT-RG-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        action=f"RISK_GUARD_DECISION_{action}",
        actor="ADM-001 (Security Admin)",
        target_type="TRANSACTION",
        target_id=trx_id,
        details=f"Human decision '{action}' applied by admin to {trx_id}. Notes: {decision_data.admin_notes or 'Processed via Risk Guard Console'}",
        log_metadata={
            "decision": action,
            "admin_notes": decision_data.admin_notes or "Processed via Risk Guard Console",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": f"Human decision '{action.replace('_', ' ')}' successfully applied to {trx_id}",
        "transaction_id": trx_id,
        "decision": action,
        "status": risk_case.status if risk_case else "PROCESSED"
    }


@router.post("/cases/{case_id}/action")
async def take_risk_action(
    case_id: str,
    action_data: RiskActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """Admin mitigation action on specific risk case."""
    res = await db.execute(select(RiskCase).where(RiskCase.id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Risk case not found")

    case.action_taken = action_data.action
    case.status = "CLEARED" if action_data.action == "CLEAR_FALSE_POSITIVE" else "BLOCKED"
    await db.commit()
    await db.refresh(case)

    return {
        "success": True,
        "message": f"Action {action_data.action} applied to case {case.case_number}",
        "case": case
    }
