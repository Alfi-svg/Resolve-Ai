import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db, check_db_connection
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("", response_model=HealthResponse)
async def get_health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint: verifies API, Database, and AI Engine status."""
    db_status = await check_db_connection()

    ai_status = {
        "status": "operational",
        "mode": "demo_deterministic" if settings.DEMO_AI_MODE else "external_model",
        "demo_ai_mode": settings.DEMO_AI_MODE,
        "provider": settings.AI_PROVIDER,
        "capabilities": [
            "Intent Analysis",
            "Transaction Identification",
            "Evidence Timeline Retrieval",
            "Root Cause Analysis",
            "Policy RAG Matching",
            "Fraud Risk Scoring",
            "Resolution Recommendation"
        ]
    }

    return HealthResponse(
        status="healthy" if db_status.get("healthy") else "degraded",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENV,
        database=db_status,
        ai_engine=ai_status,
        timestamp=datetime.datetime.utcnow().isoformat()
    )
