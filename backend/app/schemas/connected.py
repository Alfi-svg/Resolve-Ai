from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.synthetic import UserResponse, TransactionResponse, SupportCaseResponse, EvidenceResponse, AIInvestigationResponse
from app.schemas.investigation import FinalInvestigationObject


# ---------------------------------------------------------------------------
# AUTH DEMO SCHEMAS
# ---------------------------------------------------------------------------
class DemoLoginRequest(BaseModel):
    role: str = "USER"  # "USER" or "ADMIN"
    user_id: Optional[str] = "USR-ALFI-01"


class DemoLoginResponse(BaseModel):
    success: bool = True
    token: str
    role: str
    user: UserResponse
    permissions: List[str]
    session_expires_at: str


class DemoUserLoginRequest(BaseModel):
    phone: str
    pin: str


class DemoUserPayload(BaseModel):
    id: str = "USR-1001"
    name: str = "Demo User"
    phone: str = "01700000000"


class DemoUserLoginResponse(BaseModel):
    authenticated: bool = True
    role: str = "user"
    demo_mode: bool = True
    user: DemoUserPayload


class DemoAdminLoginRequest(BaseModel):
    email: str
    password: str


class DemoAdminPayload(BaseModel):
    id: str = "ADM-001"
    name: str = "ResolveAI Admin"
    email: str = "admin@resolveai.demo"


class DemoAdminLoginResponse(BaseModel):
    authenticated: bool = True
    role: str = "admin"
    demo_mode: bool = True
    admin: DemoAdminPayload


# ---------------------------------------------------------------------------
# RISK SCHEMAS (Clean /api/risk/... aliases)
# ---------------------------------------------------------------------------
class RiskAnalyzeRequest(BaseModel):
    transaction_id: str
    complaint_text: Optional[str] = None
    override_signals: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# ADMIN SCHEMAS
# ---------------------------------------------------------------------------
class AdminOverviewResponse(BaseModel):
    active_cases: int
    ai_investigations_count: int
    pending_approvals_count: int
    high_risk_transactions_count: int
    open_incidents_count: int
    resolution_rate_percent: float
    avg_resolution_time_seconds: int
    total_volume_bdt: float
    system_health_status: str = "HEALTHY"


# ---------------------------------------------------------------------------
# APPROVAL WORKFLOW SCHEMAS
# ---------------------------------------------------------------------------
class ApprovalActionRequest(BaseModel):
    admin_id: Optional[str] = "ADM-OPS-ALFI"
    reason: Optional[str] = None
    admin_notes: Optional[str] = None
    refund_amount: Optional[float] = None


class ApprovalResultResponse(BaseModel):
    success: bool
    case_id: str
    action: str  # "APPROVE", "REJECT", "ESCALATE"
    previous_status: str
    new_status: str
    reason: str
    audit_id: str
    timestamp: str
    details: str


# ---------------------------------------------------------------------------
# ANALYTICS SCHEMAS
# ---------------------------------------------------------------------------
class DailyTrendPoint(BaseModel):
    date: str
    cases_opened: int
    auto_resolved: int
    human_approved: int
    volume_bdt: float


class AnalyticsOverviewResponse(BaseModel):
    resolution_rate: float
    avg_resolution_seconds: int
    total_cases_analyzed: int
    auto_resolved_count: int
    human_approved_count: int
    rejected_count: int
    escalated_count: int
    total_refunded_bdt: float
    channel_distribution: Dict[str, int]
    intent_distribution: Dict[str, int]
    daily_trends: List[DailyTrendPoint]
