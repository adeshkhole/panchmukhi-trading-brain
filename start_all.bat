@echo off
echo Starting Panchmukhi Trading Brain Pro...

:: Start Backend (Port 8083)
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Start ML Services (Port 8000)
echo Starting ML Services...
start "ML Services" cmd /k "cd ml-services && pip install -r requirements.txt && uvicorn app:app --reload --port 8000"

:: Start Frontend (Port 3000)
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && python -m http.server 3000"

echo All services started!
echo Backend: http://localhost:8083
echo ML Services: http://localhost:8000
echo Frontend: http://localhost:3000
pause
