from typing import Dict, Any, List
from .root_cause import analyze_root_cause
from .policy_rag import retrieve_relevant_policy
from .resolution import recommend_resolution
from .summarizer import generate_case_summary
from ..models.schemas import EvidenceItem, TimelineEvent, InvestigationResult

def build_investigation(tx: Dict[str, Any]) -> Dict[str, Any]:
    tx_id = tx.get("transaction_id", "")
    amt = tx.get("amount", 0.0)
    merchant = tx.get("merchant_name") or "Merchant"
    is_hero = (tx_id == "TXN-8F31A2")
    is_failed = tx.get("needs_investigation", False)
    is_resolved = (tx.get("status") == "Resolved")
    
    # Structured Evidence items
    evidence = [
        {
            "id": "EV-01",
            "title": "Wallet Debit Confirmed",
            "status": "verified",
            "timestamp": "8:42:02 PM" if is_hero else "T+1s",
            "source": "Core Ledger Service (Node-A)",
            "explanation": f"৳{amt:,.2f} deducted successfully from customer wallet. Ledger balance verified.",
            "technical_details": "AC_DEBIT_CONFIRMED: txn_seq_99014, balance post: ৳24,580.00"
        },
        {
            "id": "EV-02",
            "title": "Gateway Request Received",
            "status": "verified",
            "timestamp": "8:42:04 PM" if is_hero else "T+3s",
            "source": "PGW-East-02 Router",
            "explanation": f"Payment payload reached payment gateway node for merchant {merchant}.",
            "technical_details": "POST /v2/charge, HTTP/2 200 INGRESS, latency: 42ms"
        },
        {
            "id": "EV-03",
            "title": "Gateway Confirmation Timeout" if is_failed and not is_resolved else ("Gateway Settled" if is_resolved else "Gateway Synchronized"),
            "status": "verified" if is_resolved else ("warning" if is_failed else "verified"),
            "timestamp": "8:42:14 PM" if is_hero else "T+13s",
            "source": "PGW-East-02 Egress Handshake",
            "explanation": "Confirmation response was delayed/interrupted. Timeout threshold (10,000ms) exceeded." if (is_failed and not is_resolved) else "Settlement batch ACK confirmed via manual reconciliation.",
            "technical_details": "ERR_SOCKET_TIMEOUT_10042MS: Gateway egress timed out waiting for upstream bank switch" if (is_failed and not is_resolved) else "BATCH_ACK_MANUAL_RECON_SUCCESS"
        },
        {
            "id": "EV-04",
            "title": "Merchant Settlement Verified" if is_resolved else ("Merchant Settlement Missing" if is_failed else "Merchant Settlement Completed"),
            "status": "verified" if is_resolved else ("failed" if is_failed else "verified"),
            "timestamp": "8:42:15 PM" if is_hero else "T+14s",
            "source": f"Merchant Clearing ({merchant})",
            "explanation": f"Merchant settlement batch updated and credit acknowledged." if is_resolved else f"Merchant ({merchant}) has not received settlement confirmation in ledger batch.",
            "technical_details": f"SETTLEMENT_RECON_TXN_{tx_id}_APPROVED" if is_resolved else "SETTLEMENT_RECORD_NOT_FOUND: clearing_batch_20261003_p2"
        },
        {
            "id": "EV-05",
            "title": "Customer Notification Sent",
            "status": "verified",
            "timestamp": "8:42:16 PM" if is_hero else "T+15s",
            "source": "Telecom SMS & Push Notification Engine",
            "explanation": "SMS notification delivered to customer mobile number.",
            "technical_details": "PUSH_DELIVERED (FCM token), SMS_DELIVERED (Teletalk/Grameenphone SMPP)"
        }
    ]
    
    # Timeline
    timeline = [
        {"time": "8:42:01 PM", "label": "Payment Initiated", "description": "Customer scanned QR code ABC Cafe", "status": "completed", "latency_ms": 12},
        {"time": "8:42:02 PM", "label": "Wallet Debit Confirmed", "description": f"৳{amt:,.2f} deducted from customer account", "status": "completed", "latency_ms": 840},
        {"time": "8:42:04 PM", "label": "Gateway Request Sent", "description": "Request dispatched to PGW-East-02", "status": "completed", "latency_ms": 204},
        {"time": "8:42:14 PM", "label": "Gateway Response Timeout" if not is_resolved else "Gateway Reconciled", "description": "Gateway socket timed out after 10,042ms" if not is_resolved else "Batch settlement reconciled manually", "status": "failed" if not is_resolved else "completed", "latency_ms": 10042},
        {"time": "8:42:15 PM", "label": "Merchant Settlement Pending" if not is_resolved else "Merchant Credited", "description": "Missing settlement entry in clearing pipeline" if not is_resolved else "Settlement batch confirmed", "status": "warning" if not is_resolved else "completed", "latency_ms": 95},
        {"time": "8:42:16 PM", "label": "Customer Notification Generated", "description": "Debit confirmation push alert delivered", "status": "completed", "latency_ms": 48}
    ]
    
    root_cause = analyze_root_cause(tx)
    policy = retrieve_relevant_policy(tx.get("transaction_type", "QR Payment"), root_cause["summary"])
    recommendation = recommend_resolution(tx, root_cause)
    ai_summary = generate_case_summary(tx, root_cause, recommendation)
    
    return {
        "transaction": tx,
        "evidence": evidence,
        "timeline": timeline,
        "root_cause": root_cause,
        "policy": policy,
        "recommendation": recommendation,
        "ai_generated_summary": ai_summary
    }
