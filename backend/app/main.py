import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .api import complaints, transactions, investigations, cases, incidents, analytics, split_payments, policies

app = FastAPI(
    title="UPAY ResolveAI Platform",
    description="AI-Powered Transaction Resolution & Service Intelligence Platform for Upay",
    version="1.0.0"
)

# Enable CORS for local dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(complaints.router)
app.include_router(transactions.router)
app.include_router(investigations.router)
app.include_router(cases.router)
app.include_router(incidents.router)
app.include_router(analytics.router)
app.include_router(split_payments.router)
app.include_router(policies.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "UPAY ResolveAI Intelligence Platform",
        "mode": "Hackathon MVP (Synthetic Environment)",
        "version": "1.0.0"
    }

# Check if frontend/dist exists to serve unified web application
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
