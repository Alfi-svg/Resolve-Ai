from typing import List, Dict, Any

POLICIES_DATABASE: List[Dict[str, Any]] = [
    {
        "policy_id": "POL-UPAY-402",
        "title": "Merchant Settlement Anomaly & Reconciliation SOP",
        "excerpt": "Transactions with confirmed wallet debit but incomplete merchant settlement require reconciliation before final resolution. Funds must not be refunded immediately if merchant services may have already rendered goods.",
        "source": "Upay Service Policy (Section 4.2)",
        "category": "QR Payment",
        "sla_turnaround": "2 to 4 hours",
        "keywords": ["qr payment", "merchant", "settlement", "debit", "reconciliation", "timeout", "cafe"]
    },
    {
        "policy_id": "POL-UPAY-701",
        "title": "Gateway Confirmation Timeout & Auto-Reversal SLA",
        "excerpt": "When payment gateway throws HTTP 504 Gateway Timeout and no terminal confirmation receipt is logged within 30 minutes, transaction is flagged for batch reconciliation. If reconciliation fails, initiate reversal review.",
        "source": "Upay Payment Operations Manual (Section 7.1)",
        "category": "Gateway Operations",
        "sla_turnaround": "24 hours maximum",
        "keywords": ["timeout", "gateway", "504", "reversal", "refund", "pending"]
    },
    {
        "policy_id": "POL-BB-MFS-88",
        "title": "Bangladesh Bank MFS Anomaly Guidelines (2022)",
        "excerpt": "In accordance with Bangladesh Bank Directive PSD/2022/88, all digital wallet disputes involving customer debit without credit to beneficiary must preserve immutable cryptographic audit logs and provide human-approved resolution.",
        "source": "Bangladesh Bank Regulatory Framework",
        "category": "Regulatory Compliance",
        "sla_turnaround": "72 hours statutory limit",
        "keywords": ["bangladesh bank", "regulatory", "audit", "compliance", "dispute"]
    },
    {
        "policy_id": "POL-UPAY-903",
        "title": "Agent Cash-Out Desynchronization Protocol",
        "excerpt": "For Cash Out transactions where customer wallet is debited but agent terminal fails to dispense cash, the agent float ledger must be audited against telecom SMS gateway before reversing wallet balance.",
        "source": "Upay Agent Banking Policy (Section 9.3)",
        "category": "Cash Out",
        "sla_turnaround": "1 hour prioritized",
        "keywords": ["cash out", "agent", "token", "atm", "float"]
    },
    {
        "policy_id": "POL-UPAY-124",
        "title": "Utility Biller Aggregator Synchronization SOP",
        "excerpt": "Utility payments (DPDC, DESCO, Titas) experiencing aggregator timeout require verification of biller acknowledgment token prior to refund to avoid power disconnection disputes.",
        "source": "Upay Bill Pay Policy (Section 12.4)",
        "category": "Bill Payment",
        "sla_turnaround": "6 hours",
        "keywords": ["bill payment", "utility", "dpdc", "electricity", "aggregator"]
    }
]

def search_policy(query: str, category: str = None) -> Dict[str, Any]:
    query_lower = query.lower()
    best_match = POLICIES_DATABASE[0]
    best_score = 75
    
    for pol in POLICIES_DATABASE:
        score = 60
        if category and category.lower() in pol["category"].lower():
            score += 20
        for kw in pol["keywords"]:
            if kw in query_lower:
                score += 15
        if score > best_score:
            best_score = min(score, 98)
            best_match = pol
            
    res = dict(best_match)
    res["relevance_score"] = best_score
    return res
