# Plano — Subscription Management System

Production-ready MERN + Next.js subscription management platform.

---

## Stack

| Layer | Technology |
|---|---|
| **API** | Node.js · Express.js |
| **Frontend** | Next.js (App Router) |
| **Database** | MongoDB + Mongoose |
| **Cache / Queue** | Redis + BullMQ |
| **Process Manager** | PM2 (cluster mode) |
| **Reverse Proxy** | Nginx |
| **Logging** | Winston + daily-rotate-file |
| **Security** | Helmet · CORS · Rate Limiting |
| **Docs** | Swagger UI (OpenAPI 3.0) |

---

## Project Structure

```
plano/
├── backend/          Express API (port 5000)
├── frontend/         Next.js app (port 3000)
├── status/           BullMQ board (port 5050)
├── nginx/            Nginx config
├── logs/
│   ├── app/          app-YYYY-MM-DD.log
│   └── error/        error-YYYY-MM-DD.log
├── ecosystem.config.cjs   PM2 process config
├── setup.sh          One-shot server setup
└── update.sh         Zero-downtime deploy
```

---

## Modules

| Module | Description |
|---|---|
| **Auth** | JWT access + refresh tokens, password reset |
| **Users** | User management with RBAC |
| **Products** | Product catalog with SKU, pricing, tax refs |
| **Plans** | Recurring billing plans (monthly/quarterly/annual) |
| **Subscriptions** | Full lifecycle: trial → active → paused → cancelled |
| **Quotations** | Draft → send → accept → convert to subscription |
| **Invoices** | Auto-numbered, PDF generation, void/paid tracking |
| **Payments** | Multi-gateway, refunds, webhook handlers |
| **Discounts** | Coupon codes, % and fixed, usage caps |
| **Taxes** | GST/VAT config, inclusive/exclusive |
| **Reports** | Revenue, MRR/ARR, churn, subscription analytics |

---

## Roles

| Role | Description |
|---|---|
| `admin` | Full access to all modules |
| `internal_user` | Create/manage most resources; limited reports |
| `portal_user` | Own subscriptions, invoices, and payments only |

---

## Quick Start (Development)

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally
- Redis running locally

```bash
# Clone
git clone <repo_url> plano && cd plano

# Install dependencies
npm install --prefix backend
npm install --prefix status

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Start backend (dev)
cd backend && npm run dev

# Start status board (separate terminal)
cd status && node server.js
```

**API:** `http://localhost:5000/api/v1`  
**Swagger:** `http://localhost:5000/api-docs`  
**Status:** `http://localhost:4000/status`

---

## Production Deployment

### One-Time Setup (run on fresh server as sudo)

```bash
# Place and run setup script
chmod +x setup.sh
sudo ./setup.sh
```

What `setup.sh` does:
1. Creates `/home/app/logs/{app,error}/` + `deploy.log`
2. Clones the repo
3. `npm install` for backend + status
4. Copies `.env.example` → `.env` _(edit before starting!)_
5. Sets `PM2_HOME=/home/app/.pm2` in `/etc/environment`
6. `pm2 start ecosystem.config.js && pm2 save`
7. Fixes `.pm2` permissions for team access
8. Drops Nginx config and reloads

### Nginx — Subdomain Layout

```
sudo nano /etc/nginx/sites-available/plano
```

| Subdomain | Proxies to |
|---|---|
| `planoo.tech` | `localhost:3000` (Next.js) |
| `api.planoo.tech` | `localhost:5000` (Express) |
| `status.planoo.tech` | `localhost:4000` (BullMQ Board) |

### PM2 — Initialize

```bash
# Set shared PM2 home (run once)
echo "export PM2_HOME=/home/app/.pm2" | sudo tee -a /etc/environment
source /etc/environment

pm2 start ecosystem.config.js
pm2 save

# Fix team permissions
sudo chown -R :team /home/app/.pm2
sudo chmod -R 775   /home/app/.pm2
```

### Zero-Downtime Updates

```bash
./update.sh
```

`update.sh` flow:
1. `git fetch origin main` — check for new commits
2. Logs diff to `logs/deploy.log`
3. If changes exist: `git pull` → `npm install` → `pm2 reload all`
4. If no changes: logs "No changes to deploy" and exits

### Log Lifecycle

```
logs/
├── app/        Winston app + http logs (app-YYYY-MM-DD.log)
├── error/      Winston error logs (error-YYYY-MM-DD.log)
└── deploy.log  Deployment audit trail
```

Schedule `logs-cleanup.sh` via cron:

```bash
# Compress logs older than 5 days, delete archives after 30 days
crontab -e
# Add: 0 2 * * * /home/app/logs-cleanup.sh
```

---

## API Reference

Full interactive docs at `/api-docs` (Swagger UI).

### Key Endpoints

```
POST  /api/v1/auth/register
POST  /api/v1/auth/login
POST  /api/v1/auth/refresh-token

GET   /api/v1/subscriptions
POST  /api/v1/subscriptions         # X-Idempotency-Key required
POST  /api/v1/subscriptions/:id/cancel
POST  /api/v1/subscriptions/:id/pause
POST  /api/v1/subscriptions/:id/resume

POST  /api/v1/payments              # X-Idempotency-Key required
POST  /api/v1/payments/:id/refund
POST  /api/v1/payments/webhook/:gateway

GET   /api/v1/reports/revenue
GET   /api/v1/reports/mrr
GET   /api/v1/reports/churn
```

---

## Idempotency

All mutating endpoints (`POST /subscriptions`, `POST /payments`, `POST /invoices`, `POST /quotations`) support idempotent requests via the `X-Idempotency-Key` header:

```
X-Idempotency-Key: <uuid-v4>
```

Duplicate requests within 24 hours return the cached response without re-executing.

---

## Background Jobs (BullMQ)

| Queue | Trigger | Action |
|---|---|---|
| `invoice-generation` | Subscription created/renewed | Create invoice document |
| `email-notification` | Invoice, payment, expiry | Send transactional email |
| `subscription-lifecycle` | Daily cron @ 00:00 | Auto-renew subscriptions |
| `subscription-lifecycle` | Daily cron @ 09:00 | 3/7-day expiry warnings |
| `pdf-generation` | Quotation/invoice finalized | Generate PDF |

Monitor all queues at `/status` (Basic Auth required).

---

## Logging

Winston writes two log streams:

| File | Level | Rotation |
|---|---|---|
| `logs/app/app-YYYY-MM-DD.log` | http + info + warn | 14 days, 50MB, gzip |
| `logs/error/error-YYYY-MM-DD.log` | error + exceptions | 30 days, 20MB, gzip |

---

## Security

- **Helmet** — 10+ security headers (CSP, HSTS, X-Frame-Options…)
- **CORS** — Whitelist via `CORS_ORIGINS` env var
- **Rate Limiting** — Redis-backed with separate tiers (global/auth/payment/report)
- **JWT** — 15min access + 7d refresh with rotation
- **Idempotency** — Redis dedup with NX lock to prevent races
- **Input Validation** — Joi schemas on every mutating endpoint

---

## License

MIT