#!/usr/bin/env bash
# Environment startup for modern-seaside-stay-6319 (Vite + React + TypeScript + shadcn-ui SPA).
#
# Runs in two modes:
#   * TASK run   -> boots under `dind.sh air-workspace-start.sh`; start the dev server in the
#                   background and exit promptly so the user's task is not blocked.
#   * WARMUP run -> env-setup companion baking the filesystem snapshot; do the same work, then
#                   block in `healthcheck` until the environment is provably usable so that
#                   node_modules, the Vite dep-optimizer cache and the production build all land
#                   on disk in the snapshot.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR" && git rev-parse --show-toplevel 2>/dev/null)" || REPO_DIR=""
if [ -z "$REPO_DIR" ] || [ ! -f "$REPO_DIR/package.json" ]; then
  REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
fi
DEV_PORT=8080
DEV_LOG=/tmp/vite-dev.log
DEV_URL="http://127.0.0.1:${DEV_PORT}"

log() { echo "[startup] $*"; }

if [ ! -f "$REPO_DIR/package.json" ]; then
  log "FAILED: could not locate the repository root (no package.json at '$REPO_DIR')"
  exit 1
fi
cd "$REPO_DIR"

_ps="$(ps -ax -o args= 2>/dev/null || true)"
if grep -q 'dind.sh air-workspace-start.sh' <<<"$_ps"; then WARMUP=; MODE=TASK; else WARMUP=1; MODE=WARMUP; fi
log "mode: $MODE | repo: $REPO_DIR | node: $(node -v) | npm: $(npm -v)"

# --- dependencies (cacheable: node_modules + npm cache land in the snapshot) ----------------
if [ -f package-lock.json ]; then
  log "installing dependencies with 'npm ci' ..."
  if ! npm ci --no-audit --fund=false; then
    log "'npm ci' failed (lockfile likely out of sync with package.json); falling back to 'npm install'"
    npm install --no-audit --fund=false
  fi
else
  log "no package-lock.json; installing dependencies with 'npm install' ..."
  npm install --no-audit --fund=false
fi
log "dependencies installed ($(ls node_modules | wc -l) top-level entries)"

# --- production build (cacheable: verifies the toolchain and primes dist/ + SWC caches) ------
log "running production build ('npm run build') ..."
npm run build
log "production build finished"

# --- dev server (runtime: never captured by the snapshot, so it must start on every boot) ----
start_dev_server() {
  if curl -fsS -o /dev/null --max-time 2 "$DEV_URL/" 2>/dev/null; then
    log "a server is already answering on port ${DEV_PORT}; not starting another"
    return 0
  fi
  log "starting Vite dev server on 0.0.0.0:${DEV_PORT} (log: ${DEV_LOG}) ..."
  : >"$DEV_LOG"
  nohup npm run dev -- --host 0.0.0.0 --port "$DEV_PORT" --strictPort >>"$DEV_LOG" 2>&1 &
  DEV_PID=$!
  log "dev server started (pid ${DEV_PID})"
}

# Assert the environment really works the way a task needs it to:
#   1. the Vite dev server answers on its port and serves the SPA shell, and
#   2. it can actually transform TypeScript/JSX on demand (the entry module compiles),
#   3. the production build artifact exists.
# Keeps polling until ready; no internal timeout (the outer setup system applies one).
healthcheck() {
  log "healthcheck: waiting for the dev server to serve the app on ${DEV_URL} ..."
  local attempt=0 index=""

  while :; do
    attempt=$((attempt + 1))

    if [ -n "${DEV_PID:-}" ] && ! kill -0 "$DEV_PID" 2>/dev/null; then
      log "healthcheck FAILED: dev server process ${DEV_PID} is no longer running. Last output:"
      tail -n 40 "$DEV_LOG" || true
      return 1
    fi

    index="$(curl -fsS --max-time 10 "$DEV_URL/" 2>/dev/null || true)"
    if grep -q 'id="root"' <<<"$index" && grep -q '/src/main.tsx' <<<"$index"; then
      # The shell is served; now prove the TS/JSX transform pipeline is live.
      if curl -fsS --max-time 60 "$DEV_URL/src/main.tsx" 2>/dev/null | grep -q 'createRoot'; then
        log "healthcheck: dev server serves the SPA shell and compiles src/main.tsx"
        break
      fi
      log "healthcheck: shell served, waiting for the TS/JSX transform (attempt ${attempt}) ..."
    else
      log "healthcheck: no usable response from ${DEV_URL} yet (attempt ${attempt}) ..."
      [ $((attempt % 10)) -eq 0 ] && tail -n 10 "$DEV_LOG" 2>/dev/null || true
    fi
    sleep 3
  done

  # Warm the Vite dep-optimizer cache for the routes a task is most likely to touch.
  local route
  for route in / /apartments /amenities /gallery /booking /contact; do
    curl -fsS -o /dev/null --max-time 30 "${DEV_URL}${route}" 2>/dev/null || true
  done

  if [ ! -s dist/index.html ]; then
    log "healthcheck FAILED: dist/index.html missing — the production build did not produce output"
    return 1
  fi
  log "healthcheck: production build artifact present (dist/index.html)"

  log "healthcheck: OK"
}

start_dev_server

if [ -n "${WARMUP:-}" ]; then
  healthcheck
else
  log "TASK run: dev server is starting in the background on port ${DEV_PORT}; startup complete"
fi

log "startup finished successfully"
