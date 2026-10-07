from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import AIReasoningStep


class ResolveAIRequest(BaseModel):
    user_id: Optional[str] = "USR-ALFI-01"
    complaint_text: str
    trx_id: Optional[str] = None


class ResolveAIAnalysis(BaseModel):
    ticket_id: str
    user_id: str
    trx_id: Optional[str] = None
    detected_intent: str
    ai_confidence: float
    root_cause: str
    policy_matched: str
    risk_level: str
    recommendation: str
    suggested_action: str
    refund_amount: Optional[float] = 0.0
    reasoning_steps: List[AIReasoningStep]
    evidence_data: Dict[str, Any]
    status: str
    created_at: datetime


class ResolveAIApprovalRequest(BaseModel):
    action: str  # "APPROVE", "REJECT", "ESCALATE"
    admin_id: Optional[str] = "ADM-OPS-ALFI"
    reason: Optional[str] = None
    admin_notes: Optional[str] = None
    override_amount: Optional[float] = None
    evidence_verified: Optional[bool] = True
