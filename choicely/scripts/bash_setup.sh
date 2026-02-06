#!/usr/bin/env bash
set -eo pipefail
PROJECT_DIR="$PWD"
pushd "$HOME"
cat > ~/.bashrc <<BASHRC
unset PROMPT_COMMAND
__vsc_prompt_cmd_original() { :; }
unset -f command_not_found_handle 2>/dev/null || true
# auto-export env vars from the original project dir
if [ -d "$PROJECT_DIR" ]; then
  set -a
  [ -f "$PROJECT_DIR/default.env" ] && . "$PROJECT_DIR/default.env"
  [ -f "$PROJECT_DIR/.env" ] && . "$PROJECT_DIR/.env"
  set +a
fi
chmod -R a+x $PROJECT_DIR/scripts
BASHRC
popd
