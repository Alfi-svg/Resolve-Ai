from fastapi import APIRouter, HTTPException
from ..models.schemas import ComplaintRequest, ComplaintAnalysis
from ..ai.complaint_parser import analyze_complaint

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("/analyze", response_model=ComplaintAnalysis)
async def analyze_customer_complaint(request: ComplaintRequest):
    if not request.complaint_text.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty")
    
    result = analyze_complaint(request.complaint_text, request.customer_id)
    return result
