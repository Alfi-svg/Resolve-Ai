from typing import Dict, Any

SYSTEM_INCIDENT: Dict[str, Any] = {
    "incident_id": "INC-2026-10-03-A",
    "title": "Systemic Gateway Latency & Settlement Desync Cluster",
    "affected_transactions": 341,
    "affected_merchants": 82,
    "gateway_name": "PGW-East-02 (Upay Primary Gateway)",
    "window_minutes": 20,
    "severity": "CRITICAL",
    "status": "Active Incident Detected",
    "timestamp": "03 Oct 2026, 8:25 PM - 8:45 PM",
    "pattern_summary": "AI detected 341 consecutive transactions across 82 distinct merchants failing with HTTP 504 Gateway Timeout on PGW-East-02 within 20 minutes. Ledger debits succeeded normally, but confirmation callbacks timed out, leaving merchant settlements uncredited.",
    "nodes": [
        {"id": "c1", "label": "341 Customers", "type": "customer", "count": 341, "status": "debited"},
        {"id": "t1", "label": "341 Transactions", "type": "transaction", "count": 341, "status": "pending_settlement"},
        {"id": "m1", "label": "82 Merchants (e.g. ABC Cafe, Shwapno)", "type": "merchant", "count": 82, "status": "unsettled"},
        {"id": "g1", "label": "Gateway PGW-East-02", "type": "gateway", "count": 1, "status": "degraded_latency"},
        {"id": "f1", "label": "Root Cause: PGW-East-02 Socket Timeout", "type": "failure", "count": 1, "status": "identified"}
    ],
    "edges": [
        {"source": "c1", "target": "t1", "label": "Initiated & Debited (100%)"},
        {"source": "t1", "target": "m1", "label": "Expected Settlement"},
        {"source": "t1", "target": "g1", "label": "Routed via PGW-East-02"},
        {"source": "g1", "target": "f1", "label": "HTTP 504 (Avg 12,400ms)"},
        {"source": "f1", "target": "m1", "label": "Blocked Callback"}
    ]
}

def get_system_incident() -> Dict[str, Any]:
    return SYSTEM_INCIDENT
