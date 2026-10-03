from typing import Dict, Any

def recommend_resolution(tx: Dict[str, Any], root_cause: Dict[str, Any]) -> Dict[str, Any]:
    tx_id = tx.get("transaction_id", "")
    failure_code = tx.get("failure_code")
    amount = tx.get("amount", 0.0)
    
    if failure_code == "PGW_TIMEOUT_504" or tx.get("gateway_status") == "Timeout":
        return {
            "recommended_action": "Initiate transaction reconciliation.",
            "secondary_action": "If reconciliation fails, escalate for refund/reversal review.",
            "reason": "The transaction is debited from customer wallet but merchant settlement is incomplete due to gateway timeout.",
            "risk_level": "Medium",
            "human_approval_required": True,
            "suggested_refund_amount": amount
        }
        
    if failure_code == "AGENT_SYNC_TIMEOUT":
        return {
            "recommended_action": "Audit agent float and initiate reversal if cash was not dispensed.",
            "secondary_action": "Call agent manager to cross-verify physical counter registry.",
            "reason": "Customer wallet was debited but agent terminal session timed out before physical cash handover confirmation.",
            "risk_level": "High",
            "human_approval_required": True,
            "suggested_refund_amount": amount
        }
        
    if failure_code == "AGGREGATOR_TIMEOUT_504":
        return {
            "recommended_action": "Query utility biller settlement queue and synchronize token.",
            "secondary_action": "Issue wallet reversal within 2 hours if bill remains unpaid in DPDC portal.",
            "reason": "Aggregator timeout occurred after wallet deduction.",
            "risk_level": "Medium",
            "human_approval_required": True,
            "suggested_refund_amount": amount
        }
        
    return {
        "recommended_action": "No corrective action needed. Transaction healthy.",
        "secondary_action": "Provide standard transaction statement to customer.",
        "reason": "Transaction is verified settled with both parties acknowledged.",
        "risk_level": "Low",
        "human_approval_required": False,
        "suggested_refund_amount": None
    }
