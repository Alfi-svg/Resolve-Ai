import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.api.endpoints_synthetic import router as synthetic_router
from app.api.endpoints_connected import router as connected_router
from app.api.v1.endpoints.resolveai import router as resolveai_router
from app.api.v1.endpoints.risk_guard import router as risk_guard_router
from app.api.v1.endpoints.incidents import router as incidents_router
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.agent import router as agent_router
from app.db.session import init_db, AsyncSessionLocal
from app.seed.seed_data import seed_initial_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("upay_resolveai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed synthetic data
    logger.info("Initializing Upay ResolveAI database schema...")
    await init_db()
    async with AsyncSessionLocal() as session:
        # Seed synthetic data engine with all 4 deterministic scenarios
        await seed_initial_data(session, force_refresh=False)
    logger.info("Upay ResolveAI synthetic data engine ready.")
    yield
    # Shutdown
    logger.info("Shutting down Upay ResolveAI backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Upay ResolveAI Engine - AI-powered transaction investigation, policy RAG, and risk guard detection.",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Direct exact routes requested by prompt: /api/users, /api/transactions, etc.
app.include_router(connected_router, prefix="/api", tags=["Connected APIs Direct"])
app.include_router(synthetic_router, prefix="/api", tags=["Synthetic Fintech Intelligence"])
app.include_router(resolveai_router, prefix="/api/resolveai", tags=["ResolveAI Direct"])
app.include_router(risk_guard_router, prefix="/api/risk-guard", tags=["Risk Guard Direct"])
app.include_router(incidents_router, prefix="/api/incidents", tags=["Incidents Direct"])
app.include_router(health_router, prefix="/api/health", tags=["Health Direct"])
app.include_router(agent_router, prefix="/api/agent", tags=["Autonomous ResolveAI Agent"])
app.include_router(agent_router, prefix="/api", tags=["Autonomous Agent & User Value Extensions"])

# Also include versioned API router under /api/v1
app.include_router(synthetic_router, prefix="/api/v1", tags=["Synthetic Fintech Intelligence v1"])
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": "Understand. Investigate. Resolve.",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "demo_ai_mode": settings.DEMO_AI_MODE,
        "synthetic_endpoints": {
            "users": "/api/users",
            "transactions": "/api/transactions",
            "hero_transaction": "/api/transactions/TXN-8F31A2",
            "hero_timeline": "/api/transactions/TXN-8F31A2/timeline",
            "investigate": "/api/resolveai/investigate",
            "cases": "/api/cases",
            "gateways": "/api/gateways"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
