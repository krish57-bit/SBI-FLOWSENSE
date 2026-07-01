@echo off
echo ==========================================
echo  SBI FlowSense - Standalone Mode
echo ==========================================
echo.
echo This starts MongoDB + API Gateway (with inline detection/orchestration)
echo No Kafka needed!
echo.

:: Check if MongoDB is running
echo [1/3] Checking MongoDB...
mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB not running! Starting via Docker...
    docker start flowsense-mongo 2>nul || docker run -d --name flowsense-mongo -p 27017:27017 mongo:6.0
    timeout /t 3 >nul
) else (
    echo MongoDB is running.
)

:: Install Python dependencies
echo [2/3] Installing Python dependencies...
pip install -r services\event-ingestion\requirements-standalone.txt -q

:: Start the API server
echo [3/3] Starting FlowSense API Gateway (standalone mode)...
echo.
echo API:      http://localhost:8001
echo Frontend: http://localhost:5173  (run 'cd frontend && npm run dev' in another terminal)
echo Health:   http://localhost:8001/health
echo.
set STANDALONE=true
set MONGO_URI=mongodb://localhost:27017
cd services\event-ingestion
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
