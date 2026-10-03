import copy
from typing import List, Dict, Any, Optional

INITIAL_CASES: List[Dict[str, Any]] = [
    {
        "case_id": "CASE-1024",
        "customer_id": "CUST-01928",
        "customer_name": "Alfi",
        "issue_type": "QR Payment",
        "amount": 2000.0,
        "priority": "High",
        "ai_confidence": 92,
        "status": "Awaiting Approval",
        "assigned_agent": "Rafi (L2 Support)",
        "created_at": "03 Oct 2026, 8:43 PM",
        "updated_at": "03 Oct 2026, 8:44 PM",
        "transaction_id": "TXN-8F31A2",
        "ai_summary": "Customer reported ৳2,000 debited via QR payment at ABC Cafe without merchant credit. Root cause identified as PGW-East-02 gateway confirmation timeout. Batch reconciliation recommended.",
        "resolution_notes": None,
        "resolution_action": None
    },
    {
        "case_id": "CASE-1023",
        "customer_id": "CUST-02481",
        "customer_name": "Tariqul Islam",
        "issue_type": "Cash Out",
        "amount": 3000.0,
        "priority": "High",
        "ai_confidence": 89,
        "status": "Investigating",
        "assigned_agent": "Saima Chowdhury",
        "created_at": "03 Oct 2026, 8:39 PM",
        "updated_at": "03 Oct 2026, 8:40 PM",
        "transaction_id": "TXN-4C82D9",
        "ai_summary": "Cash Out initiated at Agent Rahim Store. Customer debited but agent terminal failed to confirm cash dispensation. Agent float verification required.",
        "resolution_notes": None,
        "resolution_action": None
    },
    {
        "case_id": "CASE-1022",
        "customer_id": "CUST-08912",
        "customer_name": "Farhana Yasmin",
        "issue_type": "Bill Payment",
        "amount": 4320.0,
        "priority": "Medium",
        "ai_confidence": 94,
        "status": "Investigating",
        "assigned_agent": "Tanvir Ahmed",
        "created_at": "03 Oct 2026, 8:41 PM",
        "updated_at": "03 Oct 2026, 8:42 PM",
        "transaction_id": "TXN-6B90E5",
        "ai_summary": "DPDC electricity bill payment debited; aggregator timeout occurred. Verification query submitted to DPDC Biller Portal.",
        "resolution_notes": None,
        "resolution_action": None
    },
    {
        "case_id": "CASE-1021",
        "customer_id": "CUST-03310",
        "customer_name": "Mehedi Hasan",
        "issue_type": "QR Payment",
        "amount": 850.0,
        "priority": "High",
        "ai_confidence": 96,
        "status": "Resolved",
        "assigned_agent": "Rafi (L2 Support)",
        "created_at": "03 Oct 2026, 8:41 PM",
        "updated_at": "03 Oct 2026, 8:50 PM",
        "transaction_id": "TXN-1D55F8",
        "ai_summary": "Shwapno Superstore QR payment timeout resolved via expedited gateway settlement. Merchant acknowledged credit.",
        "resolution_notes": "Settlement batch confirmed by merchant supervisor.",
        "resolution_action": "Reconciliation Approved"
    },
    {
        "case_id": "CASE-1020",
        "customer_id": "CUST-05512",
        "customer_name": "Nafisa Kamal",
        "issue_type": "QR Payment",
        "amount": 3490.0,
        "priority": "High",
        "ai_confidence": 91,
        "status": "New",
        "assigned_agent": "Dispute Pool",
        "created_at": "03 Oct 2026, 8:44 PM",
        "updated_at": "03 Oct 2026, 8:44 PM",
        "transaction_id": "TXN-5E99L1",
        "ai_summary": "Unimart payment timed out. Correlated with systemic PGW-East-02 gateway latency spike.",
        "resolution_notes": None,
        "resolution_action": None
    }
]

ALL_CASES = copy.deepcopy(INITIAL_CASES)

def get_cases() -> List[Dict[str, Any]]:
    return ALL_CASES

def get_case_by_id(case_id: str) -> Optional[Dict[str, Any]]:
    for c in ALL_CASES:
        if c["case_id"].upper() == case_id.upper() or c["transaction_id"].upper() == case_id.upper():
            return c
    return None

def update_case_status(case_id: str, status: str, action: str, notes: str = None) -> Optional[Dict[str, Any]]:
    for c in ALL_CASES:
        if c["case_id"].upper() == case_id.upper() or c["transaction_id"].upper() == case_id.upper():
            c["status"] = status
            c["resolution_action"] = action
            c["resolution_notes"] = notes or f"Action {action} performed by support agent."
            c["updated_at"] = "03 Oct 2026, 8:46 PM"
            return c
    return None

def create_or_update_case_from_complaint(transaction_id: str, customer_name: str, issue_type: str, amount: float, ai_summary: str) -> Dict[str, Any]:
    # Check if case exists
    for c in ALL_CASES:
        if c["transaction_id"].upper() == transaction_id.upper():
            c["ai_summary"] = ai_summary
            return c
    
    new_case = {
        "case_id": f"CASE-{1025 + len(ALL_CASES)}",
        "customer_id": "CUST-01928",
        "customer_name": customer_name,
        "issue_type": issue_type,
        "amount": amount,
        "priority": "High",
        "ai_confidence": 92,
        "status": "Awaiting Approval",
        "assigned_agent": "Rafi (L2 Support)",
        "created_at": "03 Oct 2026, 8:44 PM",
        "updated_at": "03 Oct 2026, 8:44 PM",
        "transaction_id": transaction_id,
        "ai_summary": ai_summary,
        "resolution_notes": None,
        "resolution_action": None
    }
    ALL_CASES.insert(0, new_case)
    return new_case
