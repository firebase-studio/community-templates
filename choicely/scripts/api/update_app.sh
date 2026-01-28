#!/usr/bin/env bash
set -euo pipefail

: "${CHOICELY_API_BASE:?Environment variable CHOICELY_API_BASE is required}"
: "${CHOICELY_APP_KEY:?Environment variable CHOICELY_APP_KEY is required}"
: "${CHOICELY_API_KEY:?Environment variable CHOICELY_API_KEY is required}"
: "${HOST_TUNNEL_WEB:?Environment variable HOST_TUNNEL_WEB is required}"
: "${WORKSPACE_SLUG:?Environment variable WORKSPACE_SLUG is required}"

command -v jq >/dev/null 2>&1 || {
  echo "ERROR: jq is required but not found on PATH" >&2
  exit 1
}

URL="${CHOICELY_API_BASE%/}/apps/${CHOICELY_APP_KEY}/"

auth_header=("Authorization: Bearer ${CHOICELY_API_KEY}")

APP_JSON="$(
  curl -sS \
    -X GET "$URL" \
    -H "Accept: application/json" \
    -H "${auth_header[@]}" \
    --fail-with-body
)"

MERGED_CUSTOM_DATA="$(
  jq -c \
    --arg web "$HOST_TUNNEL_WEB" \
    --arg workspace "$WORKSPACE_SLUG" \
    '
      # Start from existing custom_data if it exists and is an object; otherwise {}
      (.custom_data // {})
      | if type == "object" then . else {} end
      # Merge/overwrite only these keys
      | . + {
          bundle_url_web: $web,
          firebase_studio_workspace: $workspace
        }
    ' <<<"$APP_JSON"
)"

PATCH_PAYLOAD="$(
  jq -c \
    --arg web "$HOST_TUNNEL_WEB" \
    --arg workspace "$WORKSPACE_SLUG" \
    --argjson custom_data "$MERGED_CUSTOM_DATA" \
    '{
      rn_config: {
        dev: {
          bundle_url_web: $web
        },
        firebase_studio_workspace: $workspace
      },
      custom_data: $custom_data
    }' <<<"{}"
)"

curl -sS \
  -X PATCH "$URL" \
  -H "Content-Type: application/json" \
  -H "${auth_header[@]}" \
  --fail-with-body \
  -d "$PATCH_PAYLOAD" \
  >/dev/null
