from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..data.synthetic_data import get_transaction_by_id
from ..ai.investigator import build_investigation
from ..data.cases_data import create_or_update_case_from_complaint

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

class InvestigationRequest(BaseModel):
    transaction_id: str = "TXN-8F31A2"

@router.post("")
async def investigate_transaction(req: InvestigationRequest):
    tx = get_transaction_by_id(req.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {req.transaction_id} not found in ledger")
    
    inv = build_investigation(tx)
    
    # Auto-link or sync into case database
    create_or_update_case_from_complaint(
        transaction_id=tx["transaction_id"],
        customer_name=tx.get("customer_name", "Customer"),
        issue_type=tx.get("transaction_type", "QR Payment"),
        amount=tx.get("amount", 2000.0),
        ai_summary=inv["ai_generated_summary"]
    )
    
    return inv
