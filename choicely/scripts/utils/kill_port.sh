#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <port>" >&2
  exit 1
fi

PORT="$1"

PIDS="$(lsof -ti :"$PORT" || true)"

if [ -z "$PIDS" ]; then
  echo "No process found using port $PORT"
else
  echo "Killing processes on port $PORT:"
  echo "$PIDS"
  echo "$PIDS" | xargs kill -9
fi
