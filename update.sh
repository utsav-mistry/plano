#!/bin/bash
# =============================================================================

set -euo pipefail
#  Plano — Zero-Downtime Update Script
#  Run on every deployment to pull latest changes and reload processes.
#
#  Usage: ./update.sh
# =============================================================================

# Ensure group-writable permissions for new files
umask 002

# ── Variables ─────────────────────────────────────────────────
export PM2_HOME=/home/app/.pm2
APP_DIR=/home/app
LOG_DIR=$APP_DIR/logs
LOG_FILE=$LOG_DIR/deploy.log
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.planoo.tech/api/v1}"

# Ensure log directory exists
mkdir -p $LOG_DIR

cd $APP_DIR || exit 1

# ─────────────────────────────────────────────────────────────
echo "===== $(date) =====" | tee -a $LOG_FILE

verify_runtime() {
  # ── Reload/start using shared PM2 instance (zero-downtime) ─
  pm2 startOrReload ecosystem.config.js --update-env

  # ── Runtime verification ────────────────────────────────────
  sleep 2
  PM2_STATE_JSON="$(pm2 jlist)"
  echo "$PM2_STATE_JSON" | grep -q '"status":"online"' || {
    echo "No PM2 process is online" | tee -a $LOG_FILE
    exit 1
  }

  if echo "$PM2_STATE_JSON" | grep -Eq '"status":"(stopped|errored|stopping|launching)"'; then
    echo "One or more PM2 processes are not healthy" | tee -a $LOG_FILE
    exit 1
  fi

  curl -fsS http://127.0.0.1:5000/health >/dev/null || {
    echo "Backend health check failed" | tee -a $LOG_FILE
    exit 1
  }

  curl -fsS http://127.0.0.1:8000/api/health >/dev/null || {
    echo "Status service health check failed" | tee -a $LOG_FILE
    exit 1
  }

  curl -fsS http://127.0.0.1:3000 >/dev/null || {
    echo "Frontend health check failed" | tee -a $LOG_FILE
    exit 1
  }
}

# Fetch latest changes from origin
git fetch origin main

echo "Changes:" | tee -a $LOG_FILE
git log HEAD..origin/main --oneline | tee -a $LOG_FILE

# Check if there are any updates to deploy
if [ -n "$(git log HEAD..origin/main --oneline)" ]; then
  git pull origin main

  # ── Install / update dependencies ──────────────────────────
  echo "Installing backend dependencies..." | tee -a $LOG_FILE
  cd backend && npm install --omit=dev && cd ..

  echo "Installing status board dependencies..." | tee -a $LOG_FILE
  cd status && npm install --omit=dev && cd ..

  # Rebuild Next.js frontend if it exists
  if [ -f "frontend/package.json" ]; then
    echo "Building Next.js frontend..." | tee -a $LOG_FILE
    cd frontend || exit 1
    npm install || exit 1
    npm run build || exit 1
    npm prune --omit=dev || exit 1
    cd ..
  fi

  verify_runtime

  echo "Deployment successful" | tee -a $LOG_FILE
else
  echo "No changes to deploy; verifying running services" | tee -a $LOG_FILE
  verify_runtime
  echo "Services verified" | tee -a $LOG_FILE
fi
