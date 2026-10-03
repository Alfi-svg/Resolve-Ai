from fastapi import APIRouter
from ..models.schemas import AnalyticsData

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsData)
async def get_dashboard_analytics():
    return {
        "total_cases": 1248,
        "ai_investigated": 892,
        "human_review": 214,
        "resolved": 764,
        "escalated": 128,
        "cases_by_issue_type": {
            "QR Payment": 512,
            "Send Money": 280,
            "Add Money": 195,
            "Cash Out": 160,
            "Bill Payment": 101
        },
        "resolution_status_breakdown": {
            "Resolved": 764,
            "Investigating": 214,
            "Awaiting Approval": 142,
            "Escalated": 128
        },
        "avg_resolution_minutes": 4.2,
        "ai_accuracy_rate": 96.4,
        "gateway_health_score": 94.8,
        "dataset_label": "Synthetic Dataset"
    }
