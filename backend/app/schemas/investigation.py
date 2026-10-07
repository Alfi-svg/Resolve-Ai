from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class IntentResult(BaseModel):
    intent: str  # e.g., QR_PAYMENT_FAILURE, CASH_OUT_FAILURE, WRONG_NUMBER_TRANSFER, UNAUTHORIZED_TAKEOVER
    amount: Optional[float] = None
    issue: str  # e.g., WALLET_DEBITED_MERCHANT_NOT_CREDITED, CASH_NOT_DISPENSED, WRONG_RECIPIENT
    language: str = "bn"  # "bn", "en", "bn_en"
    confidence: float = Field(default=0.97, ge=0.0, le=1.0)
    raw_complaint: str
    extracted_entities: Dict[str, Any] = {}


class TransactionMatchResult(BaseModel):
    transaction_id: str
    confidence: float
    matching_reasons: List[str]
    matched_transaction: Optional[Dict[str, Any]] = None


class EvidenceItem(BaseModel):
    source: str  # CORE_LEDGER, PAYMENT_GATEWAY, MERCHANT_SWITCH, RECON_ENGINE, AUTH_SERVICE
    timestamp: str
    event: str
    status: str  # SUCCESS, FAILED, TIMEOUT, PENDING
    importance: str  # CRITICAL, HIGH, MEDIUM, LOW
    explanation: str


class TimelineItem(BaseModel):
    time: str
    title: str
    description: str
    status: str  # SUCCESS, TIMEOUT, FAILED, PENDING
    source: str


class RootCauseResult(BaseModel):
    root_cause_code: str
    root_cause: str
    confidence: float
    supporting_evidence: List[str]
    technical_details: Optional[str] = None


class PolicyResult(BaseModel):
    matched_policy_id: str
    matched_policy: str
    category: str
    policy_reason: str
    allowed_actions: List[str]
    sla_minutes: int = 15


class RiskResult(BaseModel):
    risk_score: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    fraud_signals: List[Dict[str, Any]] = []
    explanation: Any = ""


class RecommendationResult(BaseModel):
    action: str  # RECONCILIATION, INSTANT_REFUND, TEMPORARY_HOLD, MANUAL_REVIEW
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    reason: str
    risk: str  # LOW, MEDIUM, HIGH, CRITICAL
    requires_human_approval: bool
    suggested_refund_amount: Optional[float] = 0.0
    auto_executable: bool = False


class PipelineStepStatus(BaseModel):
    step_key: str
    title: str
    status: str  # completed, in_progress, pending, failed
    evidence: Optional[str] = None
    confidence: float = 0.95
    explanation: Any = ""
    timestamp: Optional[str] = None


class FinalInvestigationObject(BaseModel):
    investigation_id: str
    case_id: str
    complaint: str
    intent: IntentResult
    transaction: TransactionMatchResult
    evidence: List[EvidenceItem]
    timeline: List[TimelineItem]
    root_cause: RootCauseResult
    policy: PolicyResult
    risk: RiskResult
    recommendation: RecommendationResult
    confidence: float = 0.95
    approval_required: bool
    status: str = "WAITING_APPROVAL"  # WAITING_APPROVAL, APPROVED, REJECTED, AUTO_RESOLVED
    pipeline_steps: List[PipelineStepStatus] = []
    created_at: str
    ai_mode: Optional[str] = "demo"
    customer_message: Optional[str] = None
    admin_summary: Optional[str] = None
    evidence_corroboration: Optional[str] = "4 / 4 sources confirmed"
    structured_ai_response: Optional[Dict[str, Any]] = None


class CorroboratedEvidence(BaseModel):
    source: str
    status: str
    fact: str


class StructuredRootCause(BaseModel):
    code: str
    explanation: str


class StructuredRisk(BaseModel):
    score: float
    level: str
    signals: List[Dict[str, Any]] = []


class StructuredPolicy(BaseModel):
    name: str
    allowed_action: str


class StructuredRecommendation(BaseModel):
    action: str
    requires_human_approval: bool = True
    reason: str


class StructuredAIResponse(BaseModel):
    intent: str
    language: str
    entities: Dict[str, Any]
    transaction_id: str
    transaction_status: str
    issue: str
    evidence: List[CorroboratedEvidence]
    root_cause: StructuredRootCause
    risk: StructuredRisk
    policy: StructuredPolicy
    recommendation: StructuredRecommendation
    customer_message: str
    admin_summary: str
    ai_mode: str = "demo"

