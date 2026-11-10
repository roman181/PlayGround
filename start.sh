#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
PORT="${PORT:-3000}"
BUILD_DIR="$PROJECT_DIR/dist"
WEB_META_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"

run_timed() {
  /usr/bin/time -p "$@"
}

run_timed mkdir -p "$WEB_META_DIR"
if [[ -f "$PROJECT_DIR/package.json" ]]; then
  if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
    run_timed npm ci --no-audit --no-fund
  else
    run_timed npm install --no-audit --no-fund
  fi
  has_build="$(run_timed node -e 'const p=require(process.argv[1]); process.stdout.write(p.scripts?.build ? "yes" : "no")' "$PROJECT_DIR/package.json")"
  if [[ "$has_build" == yes ]]; then
    run_timed npm run build
    [[ -f "$BUILD_DIR/index.html" ]] || { echo "Build did not create $BUILD_DIR/index.html" >&2; exit 1; }
  else
    run_timed mkdir -p "$BUILD_DIR"
    run_timed cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/app.js" "$PROJECT_DIR/styles.css" "$BUILD_DIR/"
  fi
else
  echo "No package manifest; static project has no dependencies to install."
  run_timed mkdir -p "$BUILD_DIR"
  run_timed cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/app.js" "$PROJECT_DIR/styles.css" "$BUILD_DIR/"
fi

run_timed node -e 'const fs=require("node:fs"); const path=require("node:path"); fs.writeFileSync(path.join(process.argv[1], "deployment-output.json"), JSON.stringify({project:process.argv[2], directory:process.argv[3]}))' "$WEB_META_DIR" "$PROJECT_DIR" "$BUILD_DIR"
[[ -f "$BUILD_DIR/index.html" ]] || { echo "Static output is missing index.html: $BUILD_DIR" >&2; exit 1; }
[[ "$PORT" =~ ^[0-9]+$ ]] || { echo "PORT must be numeric." >&2; exit 1; }
echo "Serving $BUILD_DIR on 0.0.0.0:$PORT"
run_timed python3 -m http.server "$PORT" --bind 0.0.0.0 --directory "$BUILD_DIR"
