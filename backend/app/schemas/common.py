from typing import Any, List, Optional
from pydantic import BaseModel, Field


class AIReasoningStep(BaseModel):
    step_key: str  # e.g., "intent_detected", "trx_identified", "evidence_collected", "root_cause_analyzed", "policy_matched", "risk_evaluated", "recommendation_generated"
    title: str
    status: str = "completed"  # completed, in_progress, pending, failed
    evidence: Optional[str] = None
    confidence: float = Field(default=0.95, ge=0.0, le=1.0)
    explanation: str
    timestamp: Optional[str] = None


class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
