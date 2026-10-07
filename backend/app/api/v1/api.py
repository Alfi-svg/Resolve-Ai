from fastapi import APIRouter
from app.api.v1.endpoints import health, transactions, resolveai, risk_guard, incidents

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(resolveai.router, prefix="/resolveai", tags=["ResolveAI"])
api_router.include_router(risk_guard.router, prefix="/risk-guard", tags=["Risk Guard"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["Incident Intelligence"])
