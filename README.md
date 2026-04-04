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
# 1. Clone and navigate
git clone https://github.com/your-org/plano.git
cd plano

# 2. Install backend dependencies
cd backend && npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your values

# 4. Start backend (dev)
npm run dev

# 5. In another terminal — start status board
cd ../status && npm install && node server.js

# 6. Frontend (Next.js)
cd ../frontend && npm install && npm run dev
```

**API:** `http://localhost:5000/api/v1`  
**Swagger:** `http://localhost:5000/api-docs`  
**Status:** `http://localhost:5050/status`

---

## Production Deployment

```bash
# On a fresh Ubuntu/Debian server:
git clone https://github.com/your-org/plano.git /var/www/plano
cd /var/www/plano
sudo chmod +x setup.sh && sudo ./setup.sh

# Update .env files with production values, then:
pm2 reload all --env production
```

### Zero-Downtime Updates

```bash
cd /var/www/plano
./update.sh
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