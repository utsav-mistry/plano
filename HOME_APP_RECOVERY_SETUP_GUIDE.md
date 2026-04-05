# Plano Recovery Setup Guide (Empty /home/app)

This guide is for your exact situation:
- VM size: B2als (2 vCPU, 4 GB RAM)
- Nginx already set up
- /home/app was emptied
- /home/app must be the project root

## 1) Prepare system packages
Run as a sudo-capable user.

```bash
sudo apt-get update -y
sudo apt-get install -y git curl nginx
```

Install Node.js 20 LTS (skip if already installed):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

Install PM2 globally:

```bash
sudo npm install -g pm2
pm2 -v
```

## 2) Recreate /home/app from Git
If /home/app is empty, clone directly into it.

```bash
sudo mkdir -p /home/app
sudo chown -R $USER:$USER /home/app
cd /home/app
git clone https://github.com/utsav-mistry/plano.git .
```

Verify expected structure exists:
- /home/app/backend
- /home/app/frontend
- /home/app/status
- /home/app/ecosystem.config.js
- /home/app/update.sh

## 3) Create required folders

```bash
cd /home/app
mkdir -p logs/app logs/error
mkdir -p backend/storage/pdfs
chmod 755 backend/storage
```

## 4) Restore environment files

```bash
cd /home/app
cp -n backend/.env.example backend/.env
cp -n frontend/.env.example frontend/.env
cp -n status/.env.example status/.env
```

Now edit env files with production values:
- backend/.env
- frontend/.env
- status/.env

Critical backend values:
- NODE_ENV=production
- CORS_ORIGINS=https://planoo.tech,https://www.planoo.tech
- FRONTEND_URL=https://planoo.tech
- COOKIE_DOMAIN=.planoo.tech
- MONGODB_URI=...
- REDIS_HOST/REDIS_PORT/REDIS_PASSWORD/REDIS_TLS
- SMTP credentials

Critical frontend value:
- NEXT_PUBLIC_API_URL=https://api.planoo.tech/api/v1

## 5) Install dependencies and build frontend

```bash
cd /home/app
cd backend && npm install --omit=dev && cd ..
cd status && npm install --omit=dev && cd ..
cd frontend && npm install && npm run build && npm prune --omit=dev && cd ..
```

## 6) Start PM2 processes

```bash
cd /home/app
export PM2_HOME=/home/app/.pm2
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

## 7) Enable PM2 auto-start after reboot

```bash
export PM2_HOME=/home/app/.pm2
pm2 startup systemd -u $USER --hp /home/$USER
```

Run the command printed by PM2 (it includes sudo), then:

```bash
pm2 save
```

If you run app processes as user app instead of your current user, use:

```bash
pm2 startup systemd -u app --hp /home/app
```

## 8) Verify local services

```bash
curl -fsS http://127.0.0.1:5000/health
curl -fsS http://127.0.0.1:4000/api/health
curl -I http://127.0.0.1:3000
pm2 logs --lines 100
```

## 9) Re-check Nginx (you said already configured)
Only validate and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Optional quick public checks:
- https://planoo.tech
- https://api.planoo.tech/health
- https://status.planoo.tech

## 10) Future deploy flow
Once recovered, use:

```bash
cd /home/app
chmod +x update.sh
./update.sh
```

The current update.sh now:
- pulls latest code when available
- rebuilds frontend when needed
- runs PM2 startOrReload with updated env
- verifies frontend/backend/status health
- still verifies PM2 services even when no new commits are found

## 11) B2als stability recommendations
For 2 vCPU / 4 GB RAM, if memory pressure appears:
1. Set workers instances to 1 in ecosystem.config.js
2. If still unstable, set backend instances to 1
3. Run pm2 startOrReload ecosystem.config.js --update-env

## 12) Common recovery issues
1. 502 from Nginx:
- Check pm2 status
- Check logs under /home/app/logs/error

2. Frontend restarts repeatedly:
- Check frontend env (NEXT_PUBLIC_API_URL)
- Rebuild frontend: cd /home/app/frontend && npm run build

3. Auth looks broken across subdomains:
- Ensure backend COOKIE_DOMAIN=.planoo.tech
- Ensure CORS_ORIGINS includes your main web domains

4. Redis/Mongo connection failures:
- Re-check backend .env host/port/password/TLS
- Confirm network/firewall rules on managed services
