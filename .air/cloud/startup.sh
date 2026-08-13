#!/usr/bin/env bash
#
# Air cloud environment startup for modern-seaside-stay (Vite + React + TypeScript + shadcn-ui).
#
# Runs in two modes, announced by AIR_STARTUP_MODE:
#   warmup - snapshot-baking run (also the env-setup companion). Does the expensive,
#            cacheable work and blocks on healthcheck so the primed caches land on disk.
#   task   - real task run, boots from that snapshot. Starts the dev server in the
#            background and returns promptly.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_DIR"

DEV_PORT=8080
VITE_CONFIG=".air/cloud/vite.air.config.ts"
LOG_DIR="/tmp/air-startup"
DEV_LOG="$LOG_DIR/vite-dev-server.log"
DEV_PID_FILE="$LOG_DIR/vite-dev-server.pid"
# The browser always reaches the dev server through the proxy, which forwards its own
# public hostname as the Host header. Probing with a hostname of that shape means a
# host-check regression fails here instead of in the user's browser.
PROBE_HOST="air-startup-healthcheck.orca-proxy-staging.labs.jb.gg"
DEV_PID=""

if [ "${AIR_STARTUP_MODE:-}" = warmup ]; then WARMUP=1; else WARMUP=; fi

log() { printf '[startup] %s\n' "$*"; }

# Fetch a dev-server URL the way the user's browser arrives: through the proxy Host header.
fetch() {
  curl -fsS --max-time 30 -H "Host: $PROBE_HOST" "http://127.0.0.1:$DEV_PORT$1" 2>/dev/null || true
}

install_dependencies() {
  # npm writes node_modules/.package-lock.json on every install, so it is newer than
  # package-lock.json exactly when the installed tree already matches the lockfile.
  if [ -f node_modules/.package-lock.json ] &&
    [ node_modules/.package-lock.json -nt package-lock.json ]; then
    log "dependencies already match package-lock.json - skipping npm ci"
    return 0
  fi

  log "installing dependencies with npm ci (398 packages) ..."
  if ! npm ci --no-audit --no-fund; then
    log "npm ci failed; falling back to npm install"
    npm install --no-audit --no-fund
  fi
  log "dependencies installed"
}

# Full production build. Doubles as a real smoke test of the toolchain (TypeScript, SWC,
# Tailwind/PostCSS over every module) and primes the node_modules/.vite caches that the
# snapshot keeps, so the first task starts warm.
prime_production_build() {
  log "running production build to smoke-test the toolchain and prime caches ..."
  npm run build
  if [ ! -s dist/index.html ]; then
    log "FAILED: 'npm run build' produced no dist/index.html"
    return 1
  fi
  log "production build OK (dist/index.html present)"
}

start_dev_server() {
  mkdir -p "$LOG_DIR"

  if [ -n "$(fetch /)" ]; then
    log "a dev server is already serving on port $DEV_PORT - reusing it"
    return 0
  fi

  log "starting Vite dev server on 0.0.0.0:$DEV_PORT (log: $DEV_LOG) ..."
  # Call vite's entry with node directly: one process to supervise, and no dependency on
  # the exec bit of node_modules/.bin/vite.
  setsid nohup node node_modules/vite/bin/vite.js --config "$VITE_CONFIG" \
    >"$DEV_LOG" 2>&1 </dev/null &
  DEV_PID=$!
  echo "$DEV_PID" >"$DEV_PID_FILE"
  log "dev server started (pid $DEV_PID)"
}

# Asserts the environment works the way a task needs it to: the dev server answers on its
# port through a proxy-style Host header, serves the app shell, and transforms TSX on
# demand. Owns all of its own waiting and keeps polling until ready; the outer setup
# system applies the timeout.
healthcheck() {
  log "healthcheck: waiting for the dev server to serve the app on port $DEV_PORT ..."
  local attempt=0 index_html module_js

  while :; do
    attempt=$((attempt + 1))

    if [ -n "$DEV_PID" ] && ! kill -0 "$DEV_PID" 2>/dev/null; then
      log "healthcheck FAILED: dev server (pid $DEV_PID) exited. Last log lines:"
      tail -n 40 "$DEV_LOG" || true
      return 1
    fi

    index_html="$(fetch /)"

    if [ -n "$index_html" ]; then
      # The server answered but refused the Host header - the page would be unusable
      # through the proxy, so treat it as a hard failure rather than waiting forever.
      if printf '%s' "$index_html" | grep -qiE 'blocked request|invalid host'; then
        log "healthcheck FAILED: dev server rejected Host '$PROBE_HOST'."
        log "Set server.allowedHosts in $VITE_CONFIG. Response was:"
        printf '%s\n' "$index_html" | head -n 20
        return 1
      fi

      if printf '%s' "$index_html" | grep -q 'id="root"' &&
        printf '%s' "$index_html" | grep -q '/src/main.tsx'; then
        # Shell is served; now prove the TSX transform pipeline actually runs.
        module_js="$(fetch /src/main.tsx)"
        if printf '%s' "$module_js" | grep -q 'createRoot'; then
          log "healthcheck OK: app shell served and /src/main.tsx transformed (after ${attempt} attempt(s))"
          return 0
        fi
        if [ -n "$module_js" ]; then
          log "healthcheck: app shell served but /src/main.tsx did not transform as expected:"
          printf '%s\n' "$module_js" | head -n 10
        fi
      fi
    fi

    if [ $((attempt % 5)) -eq 0 ]; then
      log "healthcheck: still waiting (attempt $attempt) ..."
      tail -n 5 "$DEV_LOG" 2>/dev/null || true
    fi
    sleep 2
  done
}

log "repository: $REPO_DIR"
log "mode: ${AIR_STARTUP_MODE:-task}, node $(node -v), npm $(npm -v)"

install_dependencies

if [ -n "${WARMUP:-}" ]; then
  prime_production_build
else
  log "task run - skipping the production build (dist and caches come from the snapshot)"
fi

start_dev_server

if [ -n "${WARMUP:-}" ]; then
  healthcheck
  log "warmup complete - environment verified"
else
  log "task run - dev server is starting in the background on port $DEV_PORT"
fi
