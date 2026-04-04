#!/bin/bash
# =============================================================================
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

# Ensure log directory exists
mkdir -p $LOG_DIR

cd $APP_DIR || exit 1

# ─────────────────────────────────────────────────────────────
echo "===== $(date) =====" | tee -a $LOG_FILE

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
    cd frontend && npm install --omit=dev && npm run build && cd ..
  fi

  # ── Reload using shared PM2 instance (zero-downtime) ───────
  pm2 reload backend
  pm2 reload workers
  pm2 restart status     # Single instance — restart is fine

  echo "Deployment successful" | tee -a $LOG_FILE
else
  echo "No changes to deploy" | tee -a $LOG_FILE
fi
