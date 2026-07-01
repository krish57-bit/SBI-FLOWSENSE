#!/bin/bash
echo "=========================================="
echo " SBI FlowSense - Standalone Mode"
echo "=========================================="
echo ""
echo "MongoDB + API Gateway (inline detection/orchestration)"
echo "No Kafka needed!"
echo ""

# Check MongoDB
echo "[1/3] Checking MongoDB..."
if ! mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "Starting MongoDB via Docker..."
    docker start flowsense-mongo 2>/dev/null || docker run -d --name flowsense-mongo -p 27017:27017 mongo:6.0
    sleep 3
else
    echo "MongoDB is running."
fi

# Install deps
echo "[2/3] Installing dependencies..."
pip install -r services/event-ingestion/requirements-standalone.txt -q

# Start server
echo "[3/3] Starting FlowSense API..."
echo ""
echo "API:      http://localhost:8001"
echo "Frontend: http://localhost:5173  (run 'cd frontend && npm run dev')"
echo "Health:   http://localhost:8001/health"
echo ""

export STANDALONE=true
export MONGO_URI=mongodb://localhost:27017
cd services/event-ingestion
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
