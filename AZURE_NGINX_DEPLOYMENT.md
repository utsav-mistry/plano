# Azure Deployment Guide (Nginx-First)

Date: 2026-04-04
Goal: Deploy Plano on Azure with Nginx as the single reverse proxy/entry point.

## 1. Target Architecture

- Nginx on Ubuntu VM (public entry)
- Next.js frontend on localhost:3000 (PM2)
- Node API on localhost:5000 (PM2)
- Worker process on localhost (PM2)
- Optional status app on localhost:4000 (PM2)
- MongoDB: Azure Cosmos DB for MongoDB API or MongoDB Atlas
- Redis: Azure Cache for Redis
- DNS: A records to VM public IP
- TLS: Certbot (Let's Encrypt) on Nginx

Traffic flow:
Internet -> Nginx (80/443) -> local PM2 processes

## 2. Azure Resources to Create

1. Resource Group
2. Virtual Network + Subnet
3. Network Security Group (NSG)
4. Public IP (Static)
5. Ubuntu VM (22.04 LTS)
6. Azure Cache for Redis
7. Mongo database service
8. (Optional) Azure Monitor + Log Analytics

## 3. NSG Rules

Allow inbound:
- 22 (SSH) from your office/home IP only
- 80 (HTTP) from Internet
- 443 (HTTPS) from Internet

Deny direct public access to app ports:
- 3000, 4000, 5000 should NOT be open publicly

## 4. DNS Setup

Create A records to VM static public IP:
- planoo.tech
- www.planoo.tech
- api.planoo.tech
- status.planoo.tech (optional)

## 5. Server Bootstrap

SSH into VM and run:

sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

Verify:
node -v
npm -v
pm2 -v
nginx -v

## 6. App Setup

cd /var/www
sudo mkdir -p plano
sudo chown -R $USER:$USER /var/www/plano
cd /var/www/plano

git clone <YOUR_REPO_URL> .

npm install --prefix backend
npm install --prefix frontend
npm install --prefix status

Copy env:
cp backend/.env.example backend/.env

Edit backend/.env with production values:
- NODE_ENV=production
- CORS_ORIGINS=https://planoo.tech,https://www.planoo.tech
- FRONTEND_URL=https://planoo.tech
- Mongo URI (Cosmos/Atlas)
- Redis host/password/TLS
- SMTP credentials

## 7. PM2 Process Start

From repo root:

pm2 start ecosystem.config.js
pm2 save
pm2 startup

Run the command PM2 prints (with sudo), then:
pm2 save

Check:
pm2 status
pm2 logs --lines 100

## 8. Nginx Configuration (Strict Nginx Ingress)

Use your existing config as base and place it in:
/etc/nginx/sites-available/plano

Required server blocks:
- planoo.tech -> proxy_pass http://127.0.0.1:3000
- api.planoo.tech -> proxy_pass http://127.0.0.1:5000
- status.planoo.tech -> proxy_pass http://127.0.0.1:4000 (optional)

Enable config:

sudo ln -s /etc/nginx/sites-available/plano /etc/nginx/sites-enabled/plano
sudo nginx -t
sudo systemctl reload nginx

## 9. TLS (Let's Encrypt)

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d planoo.tech -d www.planoo.tech -d api.planoo.tech -d status.planoo.tech

Auto-renew check:

sudo systemctl status certbot.timer
sudo certbot renew --dry-run

## 10. Production Nginx Hardening

Add to each TLS server block:
- proxy_set_header X-Forwarded-Proto $scheme
- proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for
- proxy_set_header X-Real-IP $remote_addr
- client_max_body_size 20m
- keepalive_timeout 65

Enable gzip for text/json assets.

## 11. Redis and Mongo Wiring

Redis (Azure Cache for Redis):
- REDIS_HOST=<name>.redis.cache.windows.net
- REDIS_PORT=6380
- REDIS_PASSWORD=<key>
- REDIS_TLS=true

Mongo options:
- Cosmos Mongo API connection string
- or MongoDB Atlas connection string

Whitelist VM outbound IP where required.

## 12. Health Checks and Smoke Test

Run:
- curl http://127.0.0.1:5000/health
- curl -I https://planoo.tech
- curl -I https://api.planoo.tech/api/v1

Validate:
- Nginx up
- PM2 processes online
- API docs reachable if enabled
- Invite email flow working

## 13. Zero-Downtime Deploy Flow

From repo root:

git fetch origin main
git pull origin main
npm install --prefix backend
npm install --prefix frontend
npm install --prefix status
pm2 reload all

If frontend build is required in your setup, run it before reload.

## 14. Logging and Rotation

- Keep Winston rotating logs in /logs
- Configure Azure Monitor Agent or ship logs to Log Analytics
- Keep Nginx access/error logs enabled for ingress diagnostics

## 15. Backup and Recovery Minimum

- Mongo automated backups enabled
- Redis persistence/backups enabled as per SKU
- Keep .env copy in secure vault (Azure Key Vault recommended)
- Store deployment scripts/config in repository

## 16. Security Checklist

- Disable password SSH, use key-based auth only
- Restrict SSH IP in NSG
- UFW enabled (optional extra)
- App ports 3000/4000/5000 not publicly exposed
- HTTPS only (redirect HTTP to HTTPS)
- Regular patching of VM and Node runtime

## 17. Common Failure Fixes

1. Domain not routing:
- Check DNS A record and propagation
- Confirm NSG allows 80/443

2. Nginx 502:
- PM2 process down or wrong port
- Check pm2 logs and nginx error log

3. SMTP failures:
- Confirm sender/auth mapping in backend/.env
- Verify SMTP app passwords

4. Redis connection issue:
- Ensure TLS/port settings match Azure Cache config

## 18. Recommended Azure Add-ons (Optional)

- Azure Key Vault for secrets
- Azure Front Door or Application Gateway (if later needed)
- Azure Monitor alerts (CPU, memory, process down)
- VM Scale Set only after traffic growth

This guide intentionally stays Nginx-centric and avoids over-engineering while remaining production-ready.
