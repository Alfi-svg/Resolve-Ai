from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.incident import IncidentSummary, IncidentDetail
from app.services.incident_intelligence.service import incident_service

router = APIRouter()


@router.get("", response_model=List[IncidentSummary])
async def list_incidents(db: AsyncSession = Depends(get_db)):
    """
    List all detected incidents synthesized by the Incident Intelligence clustering engine.
    Groups transactions by gateway, error type, time window, merchant, and channel.
    """
    return await incident_service.list_incidents(db)


@router.get("/{incident_id}", response_model=IncidentDetail)
async def get_incident(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Retrieve deep-dive incident intelligence dossier including timeline, 
    affected merchants breakdown, grouping criteria, and AI summary.
    """
    incident = await incident_service.get_incident(incident_id, db)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_id}' not found")
    return incident


@router.post("/{incident_id}/reroute")
async def reroute_gateway_traffic(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Activate Gateway Failover:
    Reroutes incoming checkout and transaction traffic from degraded gateway to secondary fallback.
    """
    return await incident_service.reroute_traffic(incident_id, db)


@router.post("/{incident_id}/bulk-reconcile")
async def execute_bulk_reconciliation(incident_id: str, db: AsyncSession = Depends(get_db)):
    """
    Autonomous Bulk Reconciliation:
    Executes automated refund batch for all transactions affected by the system-level outage under policy SLA.
    """
    return await incident_service.execute_bulk_reconciliation(incident_id, db)
