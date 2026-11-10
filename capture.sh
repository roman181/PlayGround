#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
: "${CAPTURE_URL:?Set CAPTURE_URL to the exact preview URL.}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to the evidence output directory.}"
RUNTIME_DIR="${RUNTIME_DIR:-/home/runner/work/_temp/omgithub-runtime}"

run_timed() {
  /usr/bin/time -p "$@"
}

[[ -f "$RUNTIME_DIR/scripts/default-capture.mjs" ]] || { echo "Capture runtime is unavailable: $RUNTIME_DIR" >&2; exit 1; }
run_timed mkdir -p "$CAPTURE_DIR"
# Capture the rendered app without clicking application controls. The runtime owns
# the browser lifecycle and reports temporary browser/navigation failures as 75.
export CAPTURE_AUTO_START=false
export CAPTURE_READY_SELECTOR='#view > *'
run_timed node "$RUNTIME_DIR/scripts/default-capture.mjs"
