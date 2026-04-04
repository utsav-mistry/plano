#!/bin/bash
# =============================================================================
#  Plano — One-Time Server Setup Script
#  Run this ONCE on a fresh server after placing it in /home/app/.
#
#  Usage:
#    chmod +x setup.sh
#    sudo ./setup.sh
# =============================================================================

# Ensure group-writable permissions for new files
umask 002

# ── Variables ─────────────────────────────────────────────────
export PM2_HOME=/home/app/.pm2
APP_DIR=/home/app
LOG_DIR=$APP_DIR/logs
REPO_URL="https://github.com/utsav-mistry/plano.git"   # <-- change this

# ── Create directory structure ────────────────────────────────
mkdir -p $LOG_DIR/app
mkdir -p $LOG_DIR/error
touch $LOG_DIR/deploy.log

echo "===== Plano Setup — $(date) =====" | tee -a $LOG_DIR/deploy.log

# ── Install system dependencies (Node, Redis, Nginx, PM2) ─────
apt-get update -qq
apt-get install -y nodejs redis-server nginx git

# Install PM2 if not present
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
fi

# ── Clone the repo ────────────────────────────────────────────
if [ ! -d "$APP_DIR/backend" ]; then
  git clone $REPO_URL $APP_DIR || exit 1
fi
cd $APP_DIR || exit 1

# ── Install dependencies ──────────────────────────────────────
echo "Installing backend dependencies..." | tee -a $LOG_DIR/deploy.log
cd backend && npm install --omit=dev && cd ..

echo "Installing status board dependencies..." | tee -a $LOG_DIR/deploy.log
cd status && npm install --omit=dev && cd ..

# Build Next.js frontend if present
if [ -f "frontend/package.json" ]; then
  echo "Building Next.js frontend..." | tee -a $LOG_DIR/deploy.log
  cd frontend && npm install && npm run build && npm prune --omit=dev && cd ..
fi

# ── Set up environment files ──────────────────────────────────
[ ! -f backend/.env ] && cp backend/.env.example backend/.env
[ ! -f status/.env  ] && cp status/.env.example  status/.env

echo ""
echo "Edit $APP_DIR/backend/.env and $APP_DIR/status/.env before starting!"
echo ""

# ── Create PDF storage dir ────────────────────────────────────
mkdir -p $APP_DIR/backend/storage/pdfs
chmod 755 $APP_DIR/backend/storage

# ── Export PM2_HOME so it persists across sessions ────────────
grep -q "PM2_HOME" /etc/environment || \
  echo "PM2_HOME=/home/app/.pm2" | tee -a /etc/environment
source /etc/environment

# ── Copy Nginx config ─────────────────────────────────────────
cp $APP_DIR/nginx/plano.conf /etc/nginx/sites-available/plano
ln -sf /etc/nginx/sites-available/plano /etc/nginx/sites-enabled/plano
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── Start PM2 ─────────────────────────────────────────────────
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save

# ── PM2 startup (survive reboots) ─────────────────────────────
pm2 startup systemd -u app --hp /home/app

# ── Final permission fix ──────────────────────────────────────
chown -R :team $APP_DIR/.pm2 2>/dev/null || true
chmod -R 775  $APP_DIR/.pm2  2>/dev/null || true

# ── Schedule log cleanup via cron ─────────────────────────────
CRON_JOB="0 2 * * * $APP_DIR/logs-cleanup.sh >> $LOG_DIR/deploy.log 2>&1"
(crontab -l 2>/dev/null | grep -qF "logs-cleanup" ) || \
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "" | tee -a $LOG_DIR/deploy.log
echo "===== Setup complete — $(date) =====" | tee -a $LOG_DIR/deploy.log
echo ""
echo "  Web:    planoo.tech         → localhost:3000"
echo "  API:    api.planoo.tech     → localhost:5000"
echo "  Status: status.planoo.tech  → localhost:4000"
echo ""
pm2 list
