from typing import List
from fastapi import APIRouter, HTTPException
from ..models.schemas import SplitPayment, CreateSplitRequest
from ..data.split_payments_data import get_splits, add_split, remind_participant, mark_participant_paid

router = APIRouter(prefix="/api/split-payments", tags=["Split Payments"])

@router.get("", response_model=List[SplitPayment])
async def list_split_payments():
    return get_splits()

@router.post("", response_model=SplitPayment)
async def create_split_payment(req: CreateSplitRequest):
    data = req.dict()
    new_entry = add_split(data)
    return new_entry

@router.post("/{id}/remind")
async def send_reminder(id: str, participant: str):
    success = remind_participant(id, participant)
    if not success:
        raise HTTPException(status_code=404, detail="Split payment not found")
    return {"status": "success", "message": f"Payment reminder notification sent to {participant}"}

@router.post("/{id}/mark-paid")
async def mark_paid(id: str, participant: str):
    success = mark_participant_paid(id, participant)
    if not success:
        raise HTTPException(status_code=404, detail="Split payment or participant not found")
    return {"status": "success", "message": f"{participant} payment marked as settled"}
