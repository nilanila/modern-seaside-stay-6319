#!/usr/bin/env bash
# Environment startup for modern-seaside-stay-6319 (Vite + React + TypeScript + shadcn-ui).
#
# Runs in two modes:
#   TASK   - booted under `dind.sh air-workspace-start.sh`; start the dev server in the
#            background and exit promptly so the user's task is not kept waiting.
#   WARMUP - env-setup companion baking the filesystem snapshot; do the same work, then
#            block in `healthcheck` until the environment is proven to work so that
#            node_modules, the Vite dep-optimization cache and the production build all
#            land on disk in the snapshot.
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEV_PORT="${DEV_PORT:-8080}"
DEV_LOG="/tmp/vite-dev.log"
DEV_URL="http://127.0.0.1:${DEV_PORT}"

log() { printf '[startup] %s\n' "$*"; }
fail() { printf '[startup] ERROR: %s\n' "$*" >&2; exit 1; }

_ps="$(ps -ax -o args= 2>/dev/null)"
if grep -q 'dind.sh air-workspace-start.sh' <<<"$_ps"; then WARMUP=; else WARMUP=1; fi
log "mode: ${WARMUP:+WARMUP}${WARMUP:-TASK} | repo: $REPO_DIR"

cd "$REPO_DIR" || fail "repository directory $REPO_DIR is missing"

# ---------------------------------------------------------------- toolchain ----
command -v node >/dev/null 2>&1 || fail "node is not on PATH; this project needs Node.js + npm"
command -v npm  >/dev/null 2>&1 || fail "npm is not on PATH; this project needs Node.js + npm"
log "node $(node -v), npm $(npm -v)"

# ------------------------------------------------------------- dependencies ----
# The repo ships both package-lock.json and bun.lockb; bun is not installed in this
# image, so npm + package-lock.json is the source of truth.
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  log "installing npm dependencies (npm ci) ..."
  npm ci || fail "npm ci failed - see the output above"
  log "npm dependencies installed"
else
  log "npm dependencies already present and up to date with package-lock.json"
fi

# ------------------------------------------------------------------- build -----
# Primes the Vite/Rollup + SWC toolchain and proves TypeScript/JSX compiles.
# Cheap (~5s warm) and the artifacts are captured in the snapshot.
log "building for production (npm run build) ..."
npm run build || fail "npm run build failed - the project does not compile in this environment"
log "production build finished"

# -------------------------------------------------------------- dev server -----
# Bind 0.0.0.0 so Orca's exposed port actually serves it; --strictPort so a busy port
# is a loud failure instead of Vite silently drifting to 8081.
if curl -fsS --max-time 3 -o /dev/null "$DEV_URL/" 2>/dev/null; then
  log "a dev server is already answering on port $DEV_PORT; not starting another"
else
  log "starting Vite dev server on 0.0.0.0:$DEV_PORT (log: $DEV_LOG) ..."
  : >"$DEV_LOG"
  nohup npm run dev -- --host 0.0.0.0 --port "$DEV_PORT" --strictPort >>"$DEV_LOG" 2>&1 &
  DEV_PID=$!
  log "dev server started (pid $DEV_PID)"
fi

# ------------------------------------------------------------- healthcheck -----
# Asserts the environment works the way a real task needs it to:
#   1. the production build produced an index.html + assets bundle,
#   2. the dev server answers on its port with the app's HTML shell,
#   3. Vite's on-demand TS/JSX transform pipeline works (the entry module compiles),
#   4. a page route also resolves through the SPA fallback.
# Keeps polling until ready; no internal timeout (the outer setup system owns that).
# Fails fast only when waiting can no longer succeed (dev server process is gone).
healthcheck() {
  log "healthcheck: verifying build artifacts ..."
  [ -f dist/index.html ] || { log "healthcheck: dist/index.html missing after build"; return 1; }
  ls dist/assets/*.js >/dev/null 2>&1 || { log "healthcheck: no JS bundle in dist/assets"; return 1; }
  log "healthcheck: build artifacts OK"

  log "healthcheck: waiting for the dev server on $DEV_URL ..."
  local attempt=0 body=""
  while :; do
    attempt=$((attempt + 1))

    if [ -n "${DEV_PID:-}" ] && ! kill -0 "$DEV_PID" 2>/dev/null; then
      log "healthcheck: the dev server process (pid $DEV_PID) exited; last log lines:"
      tail -n 40 "$DEV_LOG" 2>/dev/null
      return 1
    fi

    body="$(curl -fsS --max-time 10 "$DEV_URL/" 2>/dev/null)"
    if [ -n "$body" ] && grep -q 'id="root"' <<<"$body"; then
      log "healthcheck: dev server serves the app shell on port $DEV_PORT"

      # The entry module must compile on demand - this is what a real edit-reload
      # cycle depends on, and it warms node_modules/.vite dependency optimization.
      if ! curl -fsS --max-time 60 -o /dev/null "$DEV_URL/src/main.tsx"; then
        log "healthcheck: dev server could not transform src/main.tsx; last log lines:"
        tail -n 40 "$DEV_LOG" 2>/dev/null
        return 1
      fi
      log "healthcheck: Vite transformed src/main.tsx"

      # SPA route (react-router) must resolve through the dev server's HTML fallback.
      if ! curl -fsS --max-time 30 -o /dev/null "$DEV_URL/apartments"; then
        log "healthcheck: SPA route /apartments did not respond"
        return 1
      fi
      log "healthcheck: SPA route /apartments responds"

      log "healthcheck: PASSED - environment is ready"
      return 0
    fi

    if [ $((attempt % 5)) -eq 0 ]; then
      log "healthcheck: still waiting for $DEV_URL (attempt $attempt); last log lines:"
      tail -n 5 "$DEV_LOG" 2>/dev/null
    fi
    sleep 2
  done
}

if [ -n "${WARMUP:-}" ]; then
  healthcheck || fail "healthcheck failed - the environment is not usable"
  log "startup complete (warmup verified)"
else
  log "startup complete; dev server is coming up in the background on port $DEV_PORT"
fi
