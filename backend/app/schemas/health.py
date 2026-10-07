from typing import Dict, Any, Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    environment: str
    database: Dict[str, Any]
    ai_engine: Dict[str, Any]
    timestamp: str
