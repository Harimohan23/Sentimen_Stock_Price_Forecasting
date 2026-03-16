#!/bin/bash
echo "====================================================="
echo " FinanceAI — Starting Application"
echo "====================================================="

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "[1/2] Starting Backend..."
cd "$ROOT/backend"
python main.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "Waiting 8 seconds for backend to load data..."
sleep 8

echo ""
echo "[2/2] Starting Frontend..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================================="
echo " ✅ FinanceAI is running!"
echo " Backend:  http://localhost:8000/api/docs"
echo " Frontend: http://localhost:5175"
echo " Press Ctrl+C to stop both services"
echo "====================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT
wait
