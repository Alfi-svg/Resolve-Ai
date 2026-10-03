from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceItem(BaseModel):
    id: str
    title: str
    status: str # 'verified' | 'warning' | 'failed' | 'pending'
    timestamp: str
    source: str
    explanation: str
    technical_details: Optional[str] = None

class TimelineEvent(BaseModel):
    time: str
    label: str
    description: str
    status: str # 'completed' | 'warning' | 'failed' | 'info'
    latency_ms: Optional[int] = None

class RootCauseAnalysis(BaseModel):
    summary: str
    confidence: int
    evidence_points: List[str]
    technical_reason: str
    why_we_think_this: List[str]

class PolicyMatch(BaseModel):
    policy_id: str
    title: str
    excerpt: str
    source: str
    category: str
    relevance_score: int
    sla_turnaround: str

class ResolutionRecommendation(BaseModel):
    recommended_action: str
    secondary_action: str
    reason: str
    risk_level: str # 'Low' | 'Medium' | 'High'
    human_approval_required: bool = True
    suggested_refund_amount: Optional[float] = None

class Transaction(BaseModel):
    transaction_id: str
    customer_id: str
    customer_name: str
    merchant_id: Optional[str] = None
    merchant_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    amount: float
    transaction_type: str # 'QR Payment' | 'Send Money' | 'Add Money' | 'Cash Out' | 'Bill Payment'
    timestamp: str
    wallet_status: str # 'Debited' | 'Credited' | 'Failed' | 'Unchanged'
    gateway_status: str # 'Success' | 'Timeout' | 'Declined' | 'Pending'
    merchant_status: str # 'Credited' | 'Not Credited' | 'Pending' | 'N/A'
    settlement_status: str # 'Settled' | 'Pending' | 'Missing' | 'Reversed'
    notification_status: str # 'Delivered' | 'Generated' | 'Pending' | 'Failed'
    failure_code: Optional[str] = None
    status: str # 'Needs Investigation' | 'Completed' | 'Failed' | 'Reversed'
    needs_investigation: bool = False
    events: List[Dict[str, Any]] = []

class ComplaintRequest(BaseModel):
    complaint_text: str
    customer_id: Optional[str] = "CUST-01928"

class ComplaintAnalysis(BaseModel):
    detected_issue: str
    amount: float
    status: str
    priority: str
    confidence: int
    possible_transaction_id: str
    customer_sentiment: str
    language_detected: str
    raw_complaint: str

class InvestigationResult(BaseModel):
    transaction: Transaction
    evidence: List[EvidenceItem]
    timeline: List[TimelineEvent]
    root_cause: RootCauseAnalysis
    policy: PolicyMatch
    recommendation: ResolutionRecommendation
    ai_generated_summary: str

class SupportCase(BaseModel):
    case_id: str
    customer_id: str
    customer_name: str
    issue_type: str
    amount: float
    priority: str
    ai_confidence: int
    status: str # 'New' | 'Investigating' | 'Awaiting Approval' | 'Resolved' | 'Escalated'
    assigned_agent: str
    created_at: str
    updated_at: str
    transaction_id: str
    ai_summary: str
    resolution_notes: Optional[str] = None
    resolution_action: Optional[str] = None

class CaseActionRequest(BaseModel):
    agent_id: str = "AGENT-RAFI"
    notes: Optional[str] = None
    action_type: Optional[str] = None

class IncidentGraphNode(BaseModel):
    id: str
    label: str
    type: str # 'customer' | 'transaction' | 'merchant' | 'gateway' | 'failure'
    count: Optional[int] = None
    status: str

class IncidentGraphEdge(BaseModel):
    source: str
    target: str
    label: Optional[str] = None

class SystemIncident(BaseModel):
    incident_id: str
    title: str
    affected_transactions: int
    affected_merchants: int
    gateway_name: str
    window_minutes: int
    severity: str
    status: str
    pattern_summary: str
    timestamp: str
    nodes: List[IncidentGraphNode]
    edges: List[IncidentGraphEdge]

class SplitPaymentParticipant(BaseModel):
    name: str
    phone: str
    amount: float
    status: str # 'Paid' | 'Pending' | 'Declined'
    avatar_color: str

class SplitPayment(BaseModel):
    split_id: str
    title: str
    total_amount: float
    mode: str # 'Equal Split' | 'Custom Amount' | 'Percentage'
    created_by: str
    created_at: str
    status: str # 'Active' | 'Settled'
    participants: List[SplitPaymentParticipant]

class CreateSplitRequest(BaseModel):
    title: str
    total_amount: float
    mode: str
    participants: List[SplitPaymentParticipant]

class AnalyticsData(BaseModel):
    total_cases: int
    ai_investigated: int
    human_review: int
    resolved: int
    escalated: int
    cases_by_issue_type: Dict[str, int]
    resolution_status_breakdown: Dict[str, int]
    avg_resolution_minutes: float
    ai_accuracy_rate: float
    gateway_health_score: float
    dataset_label: str = "Synthetic Dataset"
