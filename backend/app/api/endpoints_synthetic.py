from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.synthetic_repo import SyntheticRepository
from app.seed.synthetic_engine import generate_synthetic_fintech_dataset
from app.schemas.synthetic import (
    UserResponse,
    MerchantResponse,
    GatewayResponse,
    TransactionResponse,
    TransactionTimelineResponse,
    TransactionEventResponse,
    SupportCaseResponse,
    AIInvestigationResponse,
    EvidenceResponse,
    PolicyResponse
)

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    """Retrieve all simulated fintech users."""
    repo = SyntheticRepository(db)
    return await repo.get_users()


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status (SUCCESS, PARTIAL_FAILURE, FAILED)"),
    gateway_id: Optional[str] = Query(None, description="Filter by gateway ID"),
    merchant_id: Optional[str] = Query(None, description="Filter by merchant ID"),
    limit: int = Query(500, description="Page limit", le=1000),
    offset: int = Query(0, description="Offset"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve simulated transactions with flexible relational filtering."""
    repo = SyntheticRepository(db)
    return await repo.get_transactions(
        user_id=user_id,
        status=status,
        gateway_id=gateway_id,
        merchant_id=merchant_id,
        limit=limit,
        offset=offset
    )


@router.get("/transactions/{id}", response_model=TransactionResponse)
async def get_transaction(id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a single transaction by ID (e.g. TXN-8F31A2, TXN-91K82X, TXN-23A91B)."""
    repo = SyntheticRepository(db)
    txn = await repo.get_transaction_by_id(id)
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction '{id}' not found")
    return txn


@router.get("/transactions/{id}/timeline", response_model=TransactionTimelineResponse)
async def get_transaction_timeline(id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full forensic event timeline for a given transaction."""
    repo = SyntheticRepository(db)
    txn = await repo.get_transaction_by_id(id)
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction '{id}' not found")
    
    events = await repo.get_transaction_timeline(id)
    return TransactionTimelineResponse(
        transaction_id=txn.id,
        status=txn.status,
        amount=txn.amount,
        currency=txn.currency,
        events=[TransactionEventResponse.model_validate(e) for e in events]
    )


@router.get("/cases", response_model=List[SupportCaseResponse])
async def list_cases(
    status: Optional[str] = Query(None, description="Filter by case status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all support and investigation cases with nested AI findings."""
    repo = SyntheticRepository(db)
    cases = await repo.get_cases(status=status, priority=priority, user_id=user_id)
    
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


@router.get("/cases/{id}", response_model=SupportCaseResponse)
async def get_case_detail(id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve a specific support case with full forensic evidence trail."""
    repo = SyntheticRepository(db)
    c = await repo.get_case_by_id(id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Support case '{id}' not found")
        
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


@router.get("/gateways", response_model=List[GatewayResponse])
async def list_gateways(db: AsyncSession = Depends(get_db)):
    """Retrieve payment switch gateways with real-time latency and health metrics."""
    repo = SyntheticRepository(db)
    return await repo.get_gateways()


@router.get("/merchants", response_model=List[MerchantResponse])
async def list_merchants(db: AsyncSession = Depends(get_db)):
    """Retrieve simulated merchant registry."""
    repo = SyntheticRepository(db)
    return await repo.get_merchants()


@router.get("/policies", response_model=List[PolicyResponse])
async def list_policies(db: AsyncSession = Depends(get_db)):
    """Retrieve regulatory and dispute policies (Policy RAG)."""
    repo = SyntheticRepository(db)
    return await repo.get_policies()


@router.post("/seed/reset")
async def reset_synthetic_dataset(db: AsyncSession = Depends(get_db)):
    """Re-runs deterministic synthetic generation engine to reset demo state."""
    await generate_synthetic_fintech_dataset(db, force_refresh=True)
    return {
        "success": True,
        "message": "Synthetic fintech dataset regenerated successfully with 4 realistic scenarios."
    }


@router.get("/audit-logs")
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    """Retrieve chronologically ordered system and human audit logs."""
    from app.models.audit_log import AuditLog
    from sqlalchemy import select
    res = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()))
    return res.scalars().all()
