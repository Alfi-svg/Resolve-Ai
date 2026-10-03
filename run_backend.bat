@echo off
echo Starting Upay ResolveAI FastAPI Server on http://127.0.0.1:8000...
echo (Serves both the React Single Page App and all REST APIs)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
