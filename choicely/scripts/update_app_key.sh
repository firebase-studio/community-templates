#!/usr/bin/env bash
set -euo pipefail

NEW_APP_KEY="${CHOICELY_APP_KEY}"

export QR_CODE_PATH=./res/preview/qr.png
./scripts/utils/make_qr.sh "https://studio.choicely.link/?ctype=app&ckey=${NEW_APP_KEY}&link=https%3A%2F%2Fchoicely.com%2F" "$QR_CODE_PATH"
wait

while :; do
  sleep 1
done
