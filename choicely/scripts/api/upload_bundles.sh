#!/usr/bin/env bash
set -euo pipefail

: "${CHOICELY_API_BASE:?Environment variable CHOICELY_API_BASE is required}"
: "${CHOICELY_APP_KEY:?Environment variable CHOICELY_APP_KEY is required}"
: "${CHOICELY_API_KEY:?Environment variable CHOICELY_API_KEY is required}"

URL="${CHOICELY_API_BASE%/}/apps/${CHOICELY_APP_KEY}/bundles/"

archive=""
for f in ./out/bundles/bundles.tar.zst ./out/bundles/bundles.tar.gz; do
  if [[ -f "$f" ]]; then
    archive="$f"
    break
  fi
done
: "${archive:?No bundles archive found in ./out/bundles}"

curl -sS \
  -X POST "$URL" \
  -H "Authorization: Bearer ${CHOICELY_API_KEY}" \
  --fail-with-body \
  --form "bundle_archive=@${archive}" \
  --form 'metadata={}'
