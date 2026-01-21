#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-}"
PID_FILE="${2:-}"

if [ -z "$PORT" ]; then
  echo "Usage: $0 <PORT> [PID_FILE]" >&2
  exit 1
fi

if [ -z "$PID_FILE" ]; then
  PID_DIR="./tmp"
  mkdir -p "$PID_DIR"
  PID_FILE="${PID_DIR}/cloudflared-${PORT}.pid"
else
  mkdir -p "$(dirname "$PID_FILE")"
fi
echo "[tunnel] PID file: $PID_FILE" >&2

TMP_LOG="$(mktemp)"
cleanup() {
  trap - INT TERM QUIT EXIT TSTP
  echo "[tunnel] Removing temporary logs from $TMP_LOG" >&2
  rm -f "$TMP_LOG"
}
trap cleanup INT TERM QUIT EXIT TSTP

echo "[tunnel] starting cloudflared on port $PORT..." >&2

TUNNEL_URL="https://www.choicely.com"

CMD=(cloudflared tunnel --url "http://localhost:${PORT}" --no-autoupdate --pidfile "$PID_FILE")

# Start cloudflared in background
"${CMD[@]}" >"$TMP_LOG" 2>&1 &
CF_PID=$!

echo "[tunnel] waiting for cloudflared URL..." >&2

TUNNEL_URL=""
while :; do
  # If cloudflared died before giving us the URL, bail out with logs
  if ! kill -0 "$CF_PID" 2>/dev/null; then
    echo "[tunnel] cloudflared exited before printing URL" >&2
    cat "$TMP_LOG" >&2 || true
    exit 1
  fi
  TUNNEL_URL="$(grep -o 'https://[^ ]*trycloudflare.com' "$TMP_LOG" | head -n1 || true)"
  if [ -n "$TUNNEL_URL" ]; then
    break
  fi
  sleep 0.25
done

echo "[tunnel] cloudflared URL: $TUNNEL_URL" >&2
printf '%q' "$TUNNEL_URL"
