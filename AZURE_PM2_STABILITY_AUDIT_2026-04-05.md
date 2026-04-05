# Azure VM + PM2 Stability Audit (2026-04-05)

## Scope
- Frontend startup stability under PM2.
- Frontend/API/Status port integration.
- Frontend action -> API endpoint -> RBAC verification.
- Reboot-safe deployment runbook.

## Applied Stability Fixes
- PM2 frontend process now runs with app-local cwd and npm script:
  - `cwd: ./frontend`
  - `script: npm`
  - `args: run start -- -p 3000`
- Added PM2 restart controls for all services:
  - `min_uptime: 10s`
  - `max_restarts: 10`
  - `restart_delay: 5000`
  - `exp_backoff_restart_delay: 100`
- Enabled PM2 logs to file instead of `/dev/null`:
  - `logs/app/*.log`
  - `logs/error/*.log`
- Updated deploy script to use:
  - `pm2 startOrReload ecosystem.config.js --update-env`
- Added post-deploy health checks in `update.sh`:
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:5000/health`
  - `http://127.0.0.1:4000/api/health`
- Added `frontend/.env.example` and setup support for `frontend/.env`.

## Port + Service Contract
- Frontend: `localhost:3000` (PM2 app `frontend`)
- Backend API: `localhost:5000` (PM2 app `backend`)
- Status board: `localhost:4000` (PM2 app `status`)
- Nginx routing:
  - `planoo.tech` -> `localhost:3000`
  - `api.planoo.tech` -> `localhost:5000`
  - `status.planoo.tech` -> `localhost:4000`

## Frontend -> API -> RBAC Map

### Auth
- `POST /auth/register` -> Public
- `POST /auth/login` -> Public
- `POST /auth/refresh-token` -> Public (cookie-based refresh)
- `GET /auth/me` -> Authenticated
- `POST /auth/invite-customer` -> `admin`

### Users
- `GET /users` -> `admin`
- `GET /users/:id` -> `admin | internal_user`
- `PUT/PATCH /users/:id` -> `admin` or self
- `POST /users/:id/toggle-status` -> `admin`
- `DELETE /users/:id` -> `admin`

### Products
- `GET /products` / `GET /products/:id` -> Authenticated
- `POST /products` / `PUT /products/:id` -> `admin | internal_user`
- `DELETE /products/:id` -> `admin`

### Plans
- `GET /plans` / `GET /plans/:id` -> Authenticated
- `POST /plans` / `PUT /plans/:id` -> `admin | internal_user`
- `DELETE /plans/:id` -> `admin`

### Subscriptions
- `GET /subscriptions` / `GET /subscriptions/:id` -> Authenticated
- `POST /subscriptions` -> `admin | internal_user | portal_user`
- `PATCH /subscriptions/:id` -> `admin | internal_user`
- `POST /subscriptions/:id/confirm` -> `admin | internal_user`
- `POST /subscriptions/:id/activate` -> `admin | internal_user`
- `POST /subscriptions/:id/cancel` -> Authenticated (ownership enforced in controller for portal users)
- `POST /subscriptions/:id/pause` / `resume` -> `admin | internal_user`

### Quotations
- `GET /quotations` / `GET /quotations/:id` -> Authenticated
- `POST /quotations` / `PUT /quotations/:id` / `POST /:id/send` / `POST /:id/convert` -> `admin | internal_user`

### Invoices
- `GET /invoices` / `GET /invoices/:id` / `GET /invoices/:id/download` -> Authenticated
- `POST /invoices` / `POST /invoices/:id/confirm` / `POST /invoices/:id/send` -> `admin | internal_user`
- `POST /invoices/:id/cancel` / `POST /invoices/:id/void` -> `admin`

### Payments
- `GET /payments` / `GET /payments/:id` / `POST /payments` -> Authenticated
- `POST /payments/:id/refund` -> `admin`

### Discounts
- `GET /discounts` / `GET /discounts/:id` / `POST /discounts/validate` -> Authenticated
- `POST /discounts` -> `admin | internal_user`
- `PUT /discounts/:id` / `POST /discounts/:id/toggle` / `DELETE /discounts/:id` -> `admin`

### Taxes
- `GET /taxes` / `GET /taxes/:id` -> `admin | internal_user | portal_user`
- `POST/PUT/DELETE /taxes/:id` -> `admin`

### Reports
- `GET /reports/dashboard-stats` -> `admin | internal_user`
- `GET /reports/invoices` -> `admin | internal_user`
- `GET /reports/revenue|mrr|churn|subscriptions|users` -> `admin`

## Azure Reboot-Safe Runbook

### 1) One-time PM2 systemd bootstrap
```bash
export PM2_HOME=/home/app/.pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u app --hp /home/app
```

### 2) Deploy updates
```bash
cd /home/app
./update.sh
```

### 3) Verify services
```bash
pm2 status
curl -I http://127.0.0.1:3000
curl http://127.0.0.1:5000/health
curl http://127.0.0.1:4000/api/health
```

### 4) If frontend is restarting
```bash
pm2 logs frontend --lines 200
tail -n 200 /home/app/logs/error/frontend.log
tail -n 200 /home/app/logs/app/frontend.log
```

## Residual Risks
- Frontend route middleware (`frontend/proxy.ts`) checks auth-cookie presence but not role claims. Layout-level checks enforce role in UI, but middleware itself is not role-aware.
- `update.sh` uses `sleep` and `curl`; ensure both are available in VM image (standard Ubuntu images include them).
