Write-Host "Starting Upay ResolveAI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Write-Host "(Serves both the React Single Page App and REST APIs)" -ForegroundColor Cyan
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
