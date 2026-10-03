$env:PATH = "C:\Users\samiu\AppData\Local\Programs\nodejs;" + $env:PATH
Set-Location "$PSScriptRoot\frontend"
Write-Host "Starting Upay ResolveAI Frontend Dev Server on http://localhost:5173..." -ForegroundColor Green
npm run dev
