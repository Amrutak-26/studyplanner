#!/bin/bash
# Start script for Render deployment
echo "Starting Study Planner API..."
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
