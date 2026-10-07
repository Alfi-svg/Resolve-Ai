from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class IncidentTimelineEntry(BaseModel):
    timestamp: str
    event: str
    description: Optional[str] = None
    details: Optional[str] = None
    time_offset: Optional[str] = None
    failures_count: Optional[int] = None
    severity: str = "INFO"  # "INFO", "WARNING", "CRITICAL"


class IncidentSummary(BaseModel):
    id: str  # e.g., "INC-GWX-9042"
    title: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    status: str  # "ACTIVE", "MITIGATED", "RESOLVED"
    affected_gateway: str  # "Gateway-X"
    primary_failure: str  # "Confirmation Timeout"
    affected_transactions: int  # 341
    affected_merchants: int  # 82
    time_window: str  # "20 minutes"
    channel: str  # "QR_PAYMENT & APP"
    potential_root_cause: str
    ai_summary: str
    recommended_action: str
    is_synthetic: bool = True
    created_at: Optional[str] = None
    detected_at: Optional[str] = None


class IncidentDetail(IncidentSummary):
    timeline: List[IncidentTimelineEntry]
    merchant_breakdown: List[Dict[str, Any]]
    grouping_criteria: Dict[str, Any]
    sample_transactions: List[Dict[str, Any]]
    fallback_gateway: str = "City Bank PG (Secondary)"
    is_rerouted: bool = False
    bulk_reconciled: bool = False
    switch_latency_ms: int = 8450
    normalized_latency_ms: int = 110
