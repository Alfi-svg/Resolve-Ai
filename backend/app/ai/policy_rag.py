from typing import Dict, Any
from ..data.policies_data import search_policy

def retrieve_relevant_policy(tx_type: str, root_cause_summary: str) -> Dict[str, Any]:
    matched = search_policy(root_cause_summary, category=tx_type)
    return {
        "policy_id": matched["policy_id"],
        "title": matched["title"],
        "excerpt": matched["excerpt"],
        "source": matched["source"],
        "category": matched["category"],
        "relevance_score": matched["relevance_score"],
        "sla_turnaround": matched["sla_turnaround"]
    }
