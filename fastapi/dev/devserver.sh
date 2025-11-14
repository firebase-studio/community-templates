#!/bin/sh
source .venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port $PORT