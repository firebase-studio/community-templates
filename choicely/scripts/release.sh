#!/usr/bin/env bash
set -euo pipefail

npm run bundle:android 1>/dev/null &
npm run bundle:ios 1>/dev/null &
npm run bundle:web &
wait
./scripts/utils/archive_dist.sh
./scripts/api/upload_bundles.sh
