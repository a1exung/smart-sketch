#!/bin/bash

# SmartSketch Agent Start Script
# Run this from the agent/ directory: ./start.sh

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Start the agent
echo "Starting SmartSketch agent..."
echo "The agent will automatically join any LiveKit rooms created by your app."
echo ""
python main.py dev
