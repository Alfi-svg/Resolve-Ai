from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class RiskSignalItem(BaseModel):
    code: str
    name: str
    weight: int
    weight_display: Optional[str] = None
    evidence: Optional[str] = None
    triggered: bool = True


class RiskCaseResponse(BaseModel):
    id: str
    case_number: str
    user_id: str
    trx_id: Optional[str] = None
    risk_score: float
    risk_level: str
    category: str
    signals: List[Dict[str, Any]]
    ai_explanation: str
    evidence: Dict[str, Any]
    status: str
    action_taken: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RiskActionRequest(BaseModel):
    action: str  # "REQUIRE_ADDITIONAL_VERIFICATION", "AUTHORIZE_TEMPORARY_HOLD", "SEND_TO_MANUAL_REVIEW", "CLEAR_FALSE_POSITIVE"
    admin_notes: Optional[str] = None
    case_id: Optional[str] = None
    trx_id: Optional[str] = None


class RiskOverviewStats(BaseModel):
    monitored_hourly: int
    flagged_anomalies: int
    systemic_incidents: int
    model_version: str
    risk_distribution: Dict[str, int]
    pending_review_count: int


class ScamAnalysisRequest(BaseModel):
    complaint_text: str
    metadata: Optional[Dict[str, Any]] = None


class ScamAnalysisResponse(BaseModel):
    classification: str
    is_scam_suspected: bool
    confidence: float
    category_id: str
    category_title: str
    matched_categories: List[str]
    extracted_indicators: List[str]
    cautious_assessment: str
    safety_advisory: str
    recommended_action: str
    input_text: str


class FraudPatternItem(BaseModel):
    pattern_id: str
    name: str
    category: str
    severity: str
    confidence: float
    description: str
    evidence: str
    mitigation: str


class AccountTakeoverResponse(BaseModel):
    title: str
    status: str
    is_ato_suspected: bool
    risk_score: int
    max_score: int = 100
    risk_level: str
    badge_color: str
    supporting_signals: List[Dict[str, Any]]
    supporting_signals_count: int
    recommended_action: str
    governance_summary: str
    ai_disclosure: str


class RiskEvaluationResponse(BaseModel):
    transaction_id: str
    amount: Optional[float] = None
    risk_score: int
    raw_score: int
    max_score: int = 100
    risk_level: str
    risk_level_label: str
    badge_color: str
    signals: List[Dict[str, Any]]
    signals_count: int
    explanation: Dict[str, Any]
    recommendation: Dict[str, Any]
    behavioral_context: Dict[str, Any]
    pipeline_steps: List[Dict[str, Any]]
    fraud_patterns: Optional[List[Dict[str, Any]]] = None
    fraud_patterns_count: Optional[int] = 0
    account_takeover: Optional[Dict[str, Any]] = None
