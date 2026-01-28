#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 TEXT [OUTPUT.png]" >&2
  echo "Example: $0 'https://example.com' ./out/qrcode.png" >&2
  exit 1
fi

TEXT="$1"
OUT="${2:-./out/qrcode.png}"

OUT_DIR="$(dirname "$OUT")"
mkdir -p "$OUT_DIR"

if [ -e "$OUT" ]; then
  rm -f "$OUT"
fi

qrencode -o "$OUT" -s 10 -m 2 "$TEXT"
echo "QR code written to: $OUT"
