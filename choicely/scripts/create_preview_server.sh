#!/usr/bin/env bash
set -euo pipefail

: "${CHOICELY_APP_KEY:?ERROR: CHOICELY_APP_KEY is not set}"

PREVIEW_FRONTEND_PORT="${1}"
if [[ -z "${PREVIEW_FRONTEND_PORT:-}" ]]; then
  echo "ERROR: PREVIEW_FRONTEND_PORT argument is required" >&2
  exit 1
fi
if ! [[ "${PREVIEW_FRONTEND_PORT}" =~ ^[0-9]+$ ]]; then
  echo "ERROR: PREVIEW_SERVER_PORT must be a number, got: ${PREVIEW_FRONTEND_PORT}" >&2
  exit 1
fi

if [[ -z "${PREVIEW_TOKEN:-}" ]]; then
  PREVIEW_TOKEN="$(head -c 32 /dev/urandom | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')"
  export PREVIEW_TOKEN
fi

./scripts/utils/kill_port.sh "${PREVIEW_SERVER_PORT}"
SERVER_STATIC_PATH=./out/static
mkdir -p "$SERVER_STATIC_PATH"
./scripts/utils/open_web_server.sh "$SERVER_STATIC_PATH" "${PREVIEW_SERVER_PORT}" &

PREVIEW_SERVER=$(./scripts/utils/open_tunnel.sh "${PREVIEW_SERVER_PORT}")

if [ -z "${PREVIEW_SERVER:-}" ]; then
  echo "ERROR: PREVIEW_SERVER was not set by open_tunnel.sh" >&2
  exit 1
fi

echo "HOST_TUNNEL_PREVIEW: $PREVIEW_SERVER"
printf '%s="%s"\n' "HOST_TUNNEL_PREVIEW" "$PREVIEW_SERVER" >> .env

PREVIEW_DIR="res/preview"
CONFIG_JS="${PREVIEW_DIR}/config.js"
mkdir -p "$PREVIEW_DIR"

node -e "
const fs = require('fs');

const appKey=process.env.CHOICELY_APP_KEY;
const realtimeServer=process.env.CHOICELY_REALTIME_SERVER;
const token=process.env.PREVIEW_TOKEN;
const tunnel='${PREVIEW_SERVER}';
const port='${PREVIEW_SERVER_PORT}';
if(!appKey){console.error('ERROR: CHOICELY_APP_KEY is not set'); process.exit(1);}
if(!token){console.error('ERROR: PREVIEW_TOKEN is not set'); process.exit(1);}
if(!tunnel){console.error('ERROR: PREVIEW_SERVER is not set'); process.exit(1);}
if(!/^\d+$/.test(String(port))){console.error('ERROR: PREVIEW_SERVER_PORT must be a number'); process.exit(1);}

let out = '';
out += 'window.__CHOICELY_APP_KEY__=' + JSON.stringify(appKey) + ';\\n';
if (realtimeServer) out += 'window.__CHOICELY_REALTIME_SERVER__=' + JSON.stringify(realtimeServer) + ';\\n';
out += 'window.__PREVIEW_TOKEN__=' + JSON.stringify(token) + ';\\n';
out += 'window.__PREVIEW_SERVER__=' + JSON.stringify(tunnel) + ';\\n';

fs.writeFileSync('${CONFIG_JS}', out);
"

echo "Wrote ${CONFIG_JS}"

NODE_OPTIONS=--no-deprecation http-server "./${PREVIEW_DIR}" -a 0.0.0.0 -p "${PREVIEW_FRONTEND_PORT}" -c-1 --silent
