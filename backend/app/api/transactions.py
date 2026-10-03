from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..data.synthetic_data import get_all_transactions, get_transaction_by_id
from ..ai.investigator import build_investigation

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("", response_model=List[dict])
async def list_transactions(
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    txs = get_all_transactions()
    if type and type != "All":
        txs = [t for t in txs if t.get("transaction_type", "").lower() == type.lower()]
    if status and status != "All":
        txs = [t for t in txs if t.get("status", "").lower() == status.lower()]
    if search:
        s = search.lower()
        txs = [
            t for t in txs 
            if s in t.get("transaction_id", "").lower() 
            or s in (t.get("merchant_name") or "").lower()
            or s in (t.get("customer_name") or "").lower()
        ]
    return txs

@router.get("/{id}")
async def get_transaction(id: str):
    tx = get_transaction_by_id(id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {id} not found")
    return tx

@router.get("/{id}/timeline")
async def get_transaction_timeline(id: str):
    tx = get_transaction_by_id(id)
    if not tx:
        raise HTTPException(status_code=404, detail=f"Transaction {id} not found")
    inv = build_investigation(tx)
    return {"transaction_id": id, "timeline": inv["timeline"]}
