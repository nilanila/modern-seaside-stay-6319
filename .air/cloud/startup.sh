#!/usr/bin/env bash
#
# Air environment startup for modern-seaside-stay-6319
# (Vite 5 + React 18 + TypeScript + shadcn-ui + Tailwind CSS)
#
# Runs in two modes:
#   TASK   - boots under `dind.sh air-workspace-start.sh`; start the dev server in
#            the background and exit promptly so the user's task is not blocked.
#   WARMUP - the env-setup companion that bakes the filesystem snapshot; do the same
#            work, then block in `healthcheck` so every cache is on disk when the
#            snapshot is taken.
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEV_PORT=8080
DEV_HOST=0.0.0.0
DEV_LOG=/tmp/vite-dev.log
DEV_PID=/tmp/vite-dev.pid

log() { printf '[startup %s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

# ---------------------------------------------------------------------------
# Mode detection
# ---------------------------------------------------------------------------
_ps="$(ps -ax -o args= 2>/dev/null || true)"
if grep -q 'dind.sh air-workspace-start.sh' <<<"$_ps"; then
  WARMUP=
  log "mode: TASK (dev server starts in background, script exits promptly)"
else
  WARMUP=1
  log "mode: WARMUP (script blocks on healthcheck so caches land in the snapshot)"
fi

cd "$REPO_DIR"
log "repository: $REPO_DIR"
log "node $(node -v), npm $(npm -v)"

# ---------------------------------------------------------------------------
# Dependencies - the expensive, cacheable step. node_modules is snapshotted.
# ---------------------------------------------------------------------------
# --include=dev is explicit: vite/typescript/eslint are devDependencies and must be
# installed even if NODE_ENV happens to be "production" in the environment.
log "installing npm dependencies from package-lock.json ..."
if ! npm ci --include=dev --no-audit --no-fund; then
  log "npm ci failed (lockfile likely out of sync with package.json); retrying with npm install"
  npm install --include=dev --no-audit --no-fund
fi
log "npm dependencies installed"

# ---------------------------------------------------------------------------
# Prime the build caches. The production build is also a real smoke test: it
# type-checks nothing, but it does parse/transform every module in src/, so a
# broken app fails here rather than silently at runtime.
# ---------------------------------------------------------------------------
log "priming production build cache (npm run build) ..."
npm run build
log "production build succeeded"

# Type-check is informational only, and deliberately NOT a gate:
#  - `npm run lint` has pre-existing errors in this repo, and a task branch may well
#    carry type errors mid-edit; neither means the *environment* is broken.
#  - `vite build` above is the real compile gate.
# Note: the root tsconfig.json is a solution file ("files": [] + references), so a bare
# `tsc --noEmit` there silently checks nothing. The referenced projects must be named.
for tsproject in tsconfig.app.json tsconfig.node.json; do
  log "type-checking $tsproject (informational) ..."
  if npx --no-install tsc -p "$tsproject" --noEmit; then
    log "type-check clean: $tsproject"
  else
    log "WARNING: type errors in $tsproject (see above) - not failing startup"
  fi
done

# ---------------------------------------------------------------------------
# Dev server. Started in both modes; only the waiting differs.
# Bound to 0.0.0.0 so Air's exposed port 8080 actually serves it.
# ---------------------------------------------------------------------------
start_dev_server() {
  if [ -f "$DEV_PID" ] && kill -0 "$(cat "$DEV_PID")" 2>/dev/null; then
    log "dev server already running (pid $(cat "$DEV_PID"))"
    return 0
  fi
  log "starting Vite dev server on http://$DEV_HOST:$DEV_PORT (log: $DEV_LOG) ..."
  : >"$DEV_LOG"
  nohup npm run dev -- --host "$DEV_HOST" --port "$DEV_PORT" --strictPort \
    >>"$DEV_LOG" 2>&1 &
  echo $! >"$DEV_PID"
  log "dev server pid $(cat "$DEV_PID")"
}

# ---------------------------------------------------------------------------
# healthcheck - assert the environment works the way a real task needs it to.
#
# Beyond "install/build exited 0" this proves the dev server a developer actually
# uses is live and compiling the app:
#   1. GET /              -> Vite serves the SPA shell with its HMR client injected
#   2. GET /src/main.tsx  -> Vite transforms the React entry on demand (real TS/JSX
#                            compilation through the SWC plugin, not a static file)
#   3. GET /src/App.tsx   -> the router/page tree transforms too
# Requests 2 and 3 are what would break on a bad install or a compile error, so they
# are the meaningful assertion. As a side effect they populate node_modules/.vite/deps
# (Vite's optimized dependency cache), which then lands in the snapshot.
#
# Polls indefinitely on purpose - the outer setup system owns the timeout. The one
# fast-fail is the dev server process dying, which no amount of waiting fixes.
# ---------------------------------------------------------------------------
healthcheck() {
  local base="http://127.0.0.1:$DEV_PORT"
  local attempt=0 code

  log "healthcheck: waiting for the Vite dev server to serve and compile the app ..."
  while :; do
    attempt=$((attempt + 1))

    if [ -f "$DEV_PID" ] && ! kill -0 "$(cat "$DEV_PID")" 2>/dev/null; then
      log "healthcheck FAILED: the Vite dev server exited. Last 40 log lines:"
      tail -n 40 "$DEV_LOG" || true
      return 1
    fi

    if code="$(curl -fsS -o /dev/null -w '%{http_code}' "$base/" 2>/dev/null)" \
      && [ "$code" = "200" ] \
      && curl -fsS -o /dev/null "$base/src/main.tsx" 2>/dev/null \
      && curl -fsS -o /dev/null "$base/src/App.tsx" 2>/dev/null; then
      log "healthcheck OK: dev server serving on :$DEV_PORT and compiling src/main.tsx + src/App.tsx"
      return 0
    fi

    # Periodic status so a stuck healthcheck is diagnosable from logs-startup.txt.
    if [ $((attempt % 10)) -eq 0 ]; then
      log "healthcheck: still waiting (attempt $attempt, last / status: ${code:-no-response}). Recent dev-server output:"
      tail -n 10 "$DEV_LOG" || true
    fi
    sleep 2
  done
}

start_dev_server

if [ -n "${WARMUP:-}" ]; then
  healthcheck
  log "WARMUP complete: dependencies, build cache and Vite dep cache are on disk for the snapshot"
else
  log "TASK startup complete: dev server is coming up in the background on port $DEV_PORT"
fi
