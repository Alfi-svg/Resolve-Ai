from fastapi import APIRouter
from ..models.schemas import SystemIncident
from ..data.incidents_data import get_system_incident

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("", response_model=SystemIncident)
async def get_active_system_incident():
    return get_system_incident()
