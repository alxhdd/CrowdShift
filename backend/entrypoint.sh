#!/bin/bash

set -e

mkdir -p /data

cd /app

if [ ! -f /data/crowdshift.db ]; then
    echo "Database not found, running seed..."
    python seed.py
    echo "Seed done"
else
    echo "Database exists, skipping seed"
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000