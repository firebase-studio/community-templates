#!/usr/bin/env bash
set -euo pipefail

export HOST_TUNNEL_WEB="$(./scripts/utils/open_tunnel.sh "$WEB_PORT")"
printf '%s="%s"\n' "HOST_TUNNEL_WEB" "$HOST_TUNNEL_WEB" >> .env

( ./scripts/api/update_app.sh || true ) &
update_app_pid=$!

./scripts/update_app_key.sh

wait "$update_app_pid" || true
