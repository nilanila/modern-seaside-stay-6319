#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

DEV_PORT=8080
DEV_LOG=/tmp/air-dev-server.log

# TASK runs boot through air-workspace-start.sh; the env-setup WARMUP run does not.
_ps="$(ps -ax -o args= 2>/dev/null)"
if grep -q 'air-workspace-start\.sh' <<<"$_ps"; then
  WARMUP=
else
  WARMUP=1
fi

echo "[startup] installing dependencies with npm ci..."
npm ci
echo "[startup] npm ci done."

echo "[startup] building once to prime the vite/esbuild caches..."
npm run build
echo "[startup] build done."

echo "[startup] starting dev server on 0.0.0.0:${DEV_PORT} (background)..."
nohup npm run dev -- --host 0.0.0.0 --port "${DEV_PORT}" > "${DEV_LOG}" 2>&1 &
DEV_PID=$!

healthcheck() {
  echo "[healthcheck] waiting for dev server on port ${DEV_PORT}..."
  while true; do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "http://localhost:${DEV_PORT}/" || true)"
    if [ "${code}" = "200" ]; then
      body="$(curl -sS "http://localhost:${DEV_PORT}/" || true)"
      if grep -q "modern-seaside-stay" <<<"${body}"; then
        echo "[healthcheck] dev server is up and serving the app (HTTP ${code})."
        return 0
      fi
      echo "[healthcheck] got HTTP ${code} but response body didn't match expected app content, retrying..."
    else
      echo "[healthcheck] dev server not ready yet (HTTP ${code:-none}), retrying..."
    fi
    if ! kill -0 "${DEV_PID}" 2>/dev/null; then
      echo "[healthcheck] dev server process died, dumping log:"
      cat "${DEV_LOG}" || true
      return 1
    fi
    sleep 2
  done
}

if [ -n "${WARMUP}" ]; then
  healthcheck
else
  echo "[startup] TASK run: dev server starting in background, not blocking on readiness."
fi

echo "[startup] done."
