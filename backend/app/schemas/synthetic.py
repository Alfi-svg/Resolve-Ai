from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    name: str
    phone_masked: str
    account_status: str
    wallet_balance: float
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class MerchantResponse(BaseModel):
    id: str
    name: str
    category: str
    location: str
    status: str

    class Config:
        from_attributes = True


class GatewayResponse(BaseModel):
    id: str
    name: str
    status: str
    latency: int
    health_score: float

    class Config:
        from_attributes = True


class TransactionEventResponse(BaseModel):
    id: str
    transaction_id: str
    event_type: str
    source: str
    timestamp: datetime
    status: str
    metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    merchant_id: Optional[str] = None
    type: str
    amount: float
    currency: str = "BDT"
    status: str
    channel: str
    device_id: str
    location: str
    created_at: datetime
    failure_code: Optional[str] = None
    gateway_id: Optional[str] = None
    meta_info: Optional[Dict[str, Any]] = None
    
    # Nested relations if joined
    merchant: Optional[MerchantResponse] = None
    gateway: Optional[GatewayResponse] = None

    class Config:
        from_attributes = True


class TransactionTimelineResponse(BaseModel):
    transaction_id: str
    status: str
    amount: float
    currency: str
    events: List[TransactionEventResponse]


class EvidenceResponse(BaseModel):
    id: str
    investigation_id: str
    source: str
    event: str
    timestamp: datetime
    importance: str
    details: str

    class Config:
        from_attributes = True


class AIInvestigationResponse(BaseModel):
    id: str
    case_id: str
    intent: str
    transaction_id: str
    root_cause: str
    confidence: float
    risk_score: float
    recommendation: str
    status: str
    evidences: Optional[List[EvidenceResponse]] = []

    class Config:
        from_attributes = True


class SupportCaseResponse(BaseModel):
    id: str
    user_id: str
    transaction_id: str
    complaint: str
    status: str
    priority: str
    risk_score: float
    assigned_admin: Optional[str] = None
    created_at: datetime
    transaction: Optional[TransactionResponse] = None
    investigation: Optional[AIInvestigationResponse] = None

    class Config:
        from_attributes = True


class PolicyResponse(BaseModel):
    id: str
    title: str
    category: str
    rule: str
    resolution_action: str

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: str
    action: str
    actor: str
    admin_id: Optional[str] = None
    case_id: Optional[str] = None
    target_type: str
    target_id: str
    details: str
    reason: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    log_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True
