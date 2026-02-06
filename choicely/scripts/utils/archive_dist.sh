#!/usr/bin/env bash
set -euo pipefail

DIST_DIR="dist"
OUT_DIR="out/bundles"
OUT_BASE="bundles"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

detect_mode() {
  if tar --help 2>&1 | grep -qi 'zstd'; then
    echo "tar-zstd"
  elif command -v zstd >/dev/null 2>&1; then
    echo "pipe-zstd"
  else
    echo "gzip"
  fi
}

make_archive() {
  local mode="$1"
  local archive_path

  case "$mode" in
    tar-zstd|pipe-zstd) archive_path="$OUT_DIR/${OUT_BASE}.tar.zst" ;;
    gzip)              archive_path="$OUT_DIR/${OUT_BASE}.tar.gz"  ;;
    *) echo "Unknown mode: $mode" >&2; return 1 ;;
  esac

  echo "Creating archive: $archive_path (mode: $mode)"
  echo "Including: android ios web"

  rm -f "$OUT_DIR/${OUT_BASE}.tar.zst" "$OUT_DIR/${OUT_BASE}.tar.gz"

  case "$mode" in
    tar-zstd)
      if ! tar --zstd -cf "$archive_path" -C "$DIST_DIR" android ios web; then
        echo "Archive failed; cleaning up" >&2
        rm -f "$archive_path"
        return 1
      fi
      ;;
    pipe-zstd)
      if ! tar -cf - -C "$DIST_DIR" android ios web | zstd -T0 -o "$archive_path"; then
        echo "Archive failed (zstd pipe); cleaning up" >&2
        rm -f "$archive_path"
        return 1
      fi
      ;;
    gzip)
      if ! tar -czf "$archive_path" -C "$DIST_DIR" android ios web; then
        echo "Archive failed (gzip); cleaning up" >&2
        rm -f "$archive_path"
        return 1
      fi
      ;;
  esac

  echo "Archive ready: $archive_path"
}

mode="$(detect_mode)"
make_archive "$mode"
