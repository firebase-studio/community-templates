#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 PATH PORT" >&2
  echo "Example: $0 ./public 8001" >&2
  exit 1
fi

SERVE_PATH="$1"
PORT="$2"

SERVER_PID=""

cleanup() {
  trap - INT TERM QUIT EXIT TSTP
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
if [ ! -d node_modules/express ] || [ ! -d node_modules/compression ]; then
  npm install --save-dev express compression
fi
node ./scripts/utils/express-server.mjs "$SERVE_PATH" "$PORT" &
SERVER_PID=$!

wait "$SERVER_PID"
status=$?

trap cleanup INT TERM QUIT EXIT TSTP
exit "$status"
