#!/bin/bash
# =============================================================================
#  Plano — Log Lifecycle Cleanup
#  Scheduled via cron — auto-registered by setup.sh
#
#  Manual cron entry:
#    crontab -e
#    0 2 * * * /home/app/logs-cleanup.sh >> /home/app/logs/deploy.log 2>&1
# =============================================================================

LOG_DIR=/home/app/logs

# Compress logs older than 5 days
find $LOG_DIR -type f -name "*.log" -not -name "deploy.log" -mtime +5 -exec gzip {} \;

# Delete compressed archives older than 30 days
find $LOG_DIR -type f -name "*.gz" -mtime +30 -delete

echo "[$(date)] Log cleanup complete" >> $LOG_DIR/deploy.log
