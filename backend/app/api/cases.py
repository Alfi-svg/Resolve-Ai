from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..models.schemas import SupportCase, CaseActionRequest
from ..data.cases_data import get_cases, get_case_by_id, update_case_status
from ..data.synthetic_data import update_transaction_status

router = APIRouter(prefix="/api/cases", tags=["Cases"])

@router.get("", response_model=List[SupportCase])
async def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    cases = get_cases()
    if status and status != "All":
        cases = [c for c in cases if c.get("status", "").lower() == status.lower()]
    if priority and priority != "All":
        cases = [c for c in cases if c.get("priority", "").lower() == priority.lower()]
    return cases

@router.get("/{id}", response_model=SupportCase)
async def get_case(id: str):
    case = get_case_by_id(id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {id} not found")
    return case

@router.post("/{id}/approve")
async def approve_case(id: str, req: CaseActionRequest):
    case = get_case_by_id(id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {id} not found")
        
    notes = req.notes or f"Resolution approved by {req.agent_id}. Batch reconciliation executed."
    updated_case = update_case_status(id, "Resolved", "Reconciliation Approved", notes)
    
    # Also update the linked transaction in ledger
    if case.get("transaction_id"):
        update_transaction_status(case["transaction_id"], "Resolved", settlement_status="Settled")
        
    return {
        "status": "success",
        "message": "Resolution approved and transaction reconciled successfully.",
        "case": updated_case
    }

@router.post("/{id}/escalate")
async def escalate_case(id: str, req: CaseActionRequest):
    case = get_case_by_id(id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {id} not found")
        
    notes = req.notes or f"Escalated by {req.agent_id} to Tier-3 Switch Ops."
    updated_case = update_case_status(id, "Escalated", "Escalated to Operations", notes)
    
    if case.get("transaction_id"):
        update_transaction_status(case["transaction_id"], "Needs Investigation", settlement_status="Dispute Review")
        
    return {
        "status": "success",
        "message": "Case escalated to Tier-3 Operations team.",
        "case": updated_case
    }

@router.post("/{id}/request-info")
async def request_customer_info(id: str, req: CaseActionRequest):
    case = get_case_by_id(id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {id} not found")
        
    notes = req.notes or "Requested counter receipt from customer."
    updated_case = update_case_status(id, "Investigating", "Customer Info Requested", notes)
    return {
        "status": "success",
        "message": "SMS prompt sent to customer requesting merchant invoice/receipt.",
        "case": updated_case
    }
