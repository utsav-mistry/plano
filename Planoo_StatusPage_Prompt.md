# status.planoo.tech — Real-Time Status Page
## Implementation Prompt for Antigravity

---

## ROLE & CONTEXT

You are a senior fullstack engineer responsible for building and deploying a production-grade
status page at **status.planoo.tech**. The page must display real-time health monitoring for
five core services — **Redis, BullMQ, MongoDB, SMTP, and Backend** — with an overall uptime
metric prominently at the top.

**Visual reference:** Model the layout and UX after OpenAI's status page (status.openai.com):
- Global operational banner at the very top (green when all healthy, yellow/red otherwise)
- Per-service rows each with a coloured uptime history bar (90 bars = ~90 days, one bar per
  day; green = healthy, yellow = degraded, red = outage)
- Each row: service name + status icon, component count/health score, uptime % on the right
- Clean, light-mode minimal UI — white background, subtle card borders, system-safe typography

---

## TECH STACK (LOCKED)

| Layer | Choice |
|---|---|
| Frontend | **React 18 + Vite** |
| Styling | **Tailwind CSS v3** |
| State / polling | **React Query (TanStack Query v5)** — `refetchInterval: 5000` |
| Real-time push | **SSE (Server-Sent Events)** via a `/api/stream` endpoint (optional upgrade from polling) |
| Backend (health aggregator) | **Node.js + Express** (thin proxy/aggregator layer) |
| Auth (endpoint protection) | **API key via `x-api-key` header** checked in Express middleware |
| Deployment | Single `docker-compose.yml` — frontend (Nginx) + aggregator (Node) |

---

## SERVICES & DEPENDENCY MAP

```
Backend ──────────────────────── (anchor service)
   ├── Redis          (depends on Backend being reachable)
   ├── BullMQ         (depends on Redis being healthy)
   ├── MongoDB        (depends on Backend being reachable)
   └── SMTP           (independent, but degraded if Backend is down)
```

**Aggregation weight table (used for overall uptime score):**

| Service | Weight |
|---|---|
| Backend | 0.35 |
| MongoDB | 0.25 |
| Redis | 0.20 |
| BullMQ | 0.12 |
| SMTP | 0.08 |

**Downstream cascade rule:** If Backend status is `down`, all dependent services are
automatically marked `degraded` in the UI (even if their raw check passes), because they
cannot be reliably reached. The raw check result is preserved in the data but the display
status reflects the cascade.

---

## API CONTRACT

### Health Aggregator Endpoint

```
GET /api/health
Headers: x-api-key: <API_KEY>

Response 200:
{
  "timestamp": "2026-04-04T14:22:00.000Z",
  "overall": {
    "status": "operational" | "degraded" | "outage",
    "uptimePercent": 99.82,
    "message": "All systems operational"
  },
  "services": [
    {
      "id": "backend",
      "name": "Backend",
      "status": "operational" | "degraded" | "outage" | "unknown",
      "responseTimeMs": 42,
      "lastChecked": "2026-04-04T14:22:00.000Z",
      "healthScore": 98,          // 0-100 integer
      "consecutiveFailures": 0,   // hysteresis counter
      "error": null | "Connection refused" | "Timeout",
      "uptimeHistory": [           // last 90 data points (one per day)
        { "date": "2026-01-05", "status": "operational", "uptimePercent": 100 },
        ...
      ]
    },
    // ... Redis, BullMQ, MongoDB, SMTP
  ]
}
```

### SSE Stream (optional real-time upgrade)

```
GET /api/stream
Headers: x-api-key: <API_KEY>

Server pushes: text/event-stream
event: health
data: { ...same shape as /api/health response... }
```

### Individual Service Ping Endpoints (called internally by aggregator)

| Service | Check method |
|---|---|
| Backend | `GET /health` on the backend server; expect `{ status: "ok" }` within 3s |
| MongoDB | `mongoose.connection.readyState === 1`; or ping via driver |
| Redis | `client.ping()` → expect `"PONG"` within 2s |
| BullMQ | Check queue is active: `queue.getWorkers()` length > 0 + `queue.isPaused()` = false |
| SMTP | `nodemailer.createTransport(...).verify()` within 5s |

---

## MONITORING LOGIC

### Polling Loop (aggregator side, runs every 5s)

```js
// healthChecker.js — pseudo-code
const TIMEOUT_MS = { backend: 3000, redis: 2000, mongo: 2000, bullmq: 3000, smtp: 5000 };
const HYSTERESIS_THRESHOLD = 3; // require 3 consecutive failures before marking as down
const consecutiveFailures = {}; // persisted in memory (or Redis)

async function checkService(serviceId) {
  const start = Date.now();
  try {
    await withTimeout(pingFn[serviceId](), TIMEOUT_MS[serviceId]);
    consecutiveFailures[serviceId] = 0;
    return { status: "operational", responseTimeMs: Date.now() - start, error: null };
  } catch (err) {
    consecutiveFailures[serviceId] = (consecutiveFailures[serviceId] || 0) + 1;
    const status = consecutiveFailures[serviceId] >= HYSTERESIS_THRESHOLD
      ? "outage"
      : "degraded";
    return { status, responseTimeMs: Date.now() - start, error: err.message };
  }
}

// Backoff: if a service has been in outage for >3 consecutive cycles,
// reduce its check frequency to every 30s to avoid hammering a dead service.
```

### Health Score Formula

```
healthScore = 100
  - (consecutiveFailures * 15)       // deduct per failure streak
  - (responseTimeMs > 1000 ? 10 : 0) // deduct for slow response
  - (responseTimeMs > 3000 ? 20 : 0) // additional deduct for very slow
  clamped to [0, 100]
```

### Overall Uptime Aggregation

```js
function computeOverall(services) {
  const weightedScore = services.reduce((acc, svc) => {
    const w = WEIGHTS[svc.id];
    const score = svc.status === "operational" ? 1
                : svc.status === "degraded"    ? 0.5
                :                               0;
    return acc + (w * score);
  }, 0);

  // Apply cascade: if backend is down, cap overall at 0.3
  const backendDown = services.find(s => s.id === "backend")?.status === "outage";
  const final = backendDown ? Math.min(weightedScore, 0.3) : weightedScore;

  return {
    status: final > 0.9 ? "operational" : final > 0.5 ? "degraded" : "outage",
    uptimePercent: +(final * 100).toFixed(2),
    message: final > 0.9 ? "All systems operational"
           : final > 0.5 ? "Partial degradation detected"
           : "Service outage in progress"
  };
}
```

---

## UI SPECIFICATION

### Global Banner (top of page)

```
┌─────────────────────────────────────────────────────────┐
│  ✅  All systems operational                             │  ← green border+bg
│  We're not aware of any issues affecting planoo systems. │
└─────────────────────────────────────────────────────────┘
```
- Background: `#f0fdf4` (green-50), border: `#86efac` (green-300) when operational
- Background: `#fefce8`, border: `#fde047` when degraded
- Background: `#fef2f2`, border: `#fca5a5` when outage

### System Status Section

```
System Status    < Jan 2026 – Apr 2026 >

✅ Backend        —————————————————————————————    99.98% uptime
   ████████████████████████████████████████████
   (90 coloured bars, each = 1 day)

✅ MongoDB        —————————————————————————————    99.95% uptime
   ████████████████████████████████████████████

✅ Redis          —————————————————————————————    99.91% uptime

✅ BullMQ         —————————————————————————————    100% uptime

✅ SMTP           —————————————————————————————    99.87% uptime
```

Each bar: `4px wide`, `28px tall`, `2px gap`, rounded corners.
- `#22c55e` (green-500) = operational
- `#f59e0b` (amber-400) = degraded
- `#ef4444` (red-500) = outage
- `#d1d5db` (gray-300) = no data

Hover on a bar → tooltip: `"Apr 3 · Operational · 100%"` (date, status, uptime for that day).

### Service Tile Detail Row

```
[icon] Service Name     [Health: 98/100]  [42ms]  [Last checked: 14:22:01]     99.98% uptime
       [uptime history bar ×90]
```

---

## PROJECT SCAFFOLD

```
status-page/
├── apps/
│   ├── frontend/                   # React + Vite
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── GlobalBanner.jsx
│   │   │   │   ├── ServiceRow.jsx
│   │   │   │   ├── UptimeBar.jsx        # 90-bar history strip
│   │   │   │   ├── BarTooltip.jsx
│   │   │   │   └── StatusIcon.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useHealthData.js     # React Query polling hook
│   │   │   ├── lib/
│   │   │   │   └── aggregation.js       # client-side cascade display logic
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── index.html
│   │   └── vite.config.js
│   └── aggregator/                 # Node.js + Express
│       ├── src/
│       │   ├── checkers/
│       │   │   ├── checkBackend.js
│       │   │   ├── checkRedis.js
│       │   │   ├── checkMongo.js
│       │   │   ├── checkBullMQ.js
│       │   │   └── checkSMTP.js
│       │   ├── lib/
│       │   │   ├── hysteresis.js
│       │   │   ├── aggregation.js
│       │   │   ├── historyStore.js      # in-memory circular buffer, 90 days
│       │   │   └── withTimeout.js
│       │   ├── routes/
│       │   │   ├── health.js            # GET /api/health
│       │   │   └── stream.js            # GET /api/stream (SSE)
│       │   ├── middleware/
│       │   │   └── apiKeyAuth.js
│       │   └── index.js
│       └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## KEY CODE SNIPPETS

### 1. Health Check Fetch Loop (React Query)

```js
// apps/frontend/src/hooks/useHealthData.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_KEY = import.meta.env.VITE_STATUS_API_KEY;

export function useHealthData() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await axios.get("/api/health", {
        headers: { "x-api-key": API_KEY },
        timeout: 4000,
      });
      return data;
    },
    refetchInterval: 5000,           // poll every 5s
    refetchIntervalInBackground: true,
    staleTime: 4000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000), // exponential backoff
  });
}
```

### 2. Service Row / Tile Component

```jsx
// apps/frontend/src/components/ServiceRow.jsx
import { StatusIcon } from "./StatusIcon";
import { UptimeBar } from "./UptimeBar";

const STATUS_LABEL = {
  operational: "Operational",
  degraded: "Degraded Performance",
  outage: "Major Outage",
  unknown: "Unknown",
};

export function ServiceRow({ service }) {
  const { name, status, healthScore, responseTimeMs, lastChecked,
          uptimePercent, uptimeHistory } = service;

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className="font-medium text-gray-900 text-sm">{name}</span>
          <span className="text-xs text-gray-400">
            Score: {healthScore}/100 · {responseTimeMs}ms ·
            Last checked {new Date(lastChecked).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === "operational" ? "bg-green-100 text-green-700" :
            status === "degraded"    ? "bg-amber-100 text-amber-700" :
                                       "bg-red-100 text-red-700"
          }`}>{STATUS_LABEL[status]}</span>
          <span className="text-sm text-gray-500 tabular-nums">
            {uptimePercent}% uptime
          </span>
        </div>
      </div>
      <UptimeBar history={uptimeHistory} />
    </div>
  );
}
```

### 3. Uptime History Bar (90-day strip)

```jsx
// apps/frontend/src/components/UptimeBar.jsx
import { useState } from "react";

const COLOR = {
  operational: "#22c55e",
  degraded:    "#f59e0b",
  outage:      "#ef4444",
  nodata:      "#d1d5db",
};

export function UptimeBar({ history }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="relative flex gap-px">
      {history.map((day, i) => (
        <div key={i}
          className="rounded-sm cursor-pointer transition-opacity hover:opacity-80"
          style={{ width: 4, height: 28, background: COLOR[day.status] || COLOR.nodata }}
          onMouseEnter={(e) => setTooltip({ day, rect: e.target.getBoundingClientRect() })}
          onMouseLeave={() => setTooltip(null)}
        />
      ))}
      {tooltip && (
        <div className="absolute bottom-9 bg-gray-900 text-white text-xs
          px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none"
          style={{ left: 0 }}>
          {tooltip.day.date} · {STATUS_LABEL[tooltip.day.status]} · {tooltip.day.uptimePercent}%
        </div>
      )}
    </div>
  );
}
```

### 4. Aggregator — withTimeout utility

```js
// apps/aggregator/src/lib/withTimeout.js
export function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### 5. API Key Middleware

```js
// apps/aggregator/src/middleware/apiKeyAuth.js
export function apiKeyAuth(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.STATUS_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
```

---

## DESIGN TOKENS (matches OpenAI status page aesthetic)

```css
:root {
  --bg-page:          #ffffff;
  --bg-card:          #f9fafb;
  --border-default:   #e5e7eb;

  --text-primary:     #111827;
  --text-secondary:   #6b7280;
  --text-muted:       #9ca3af;

  --green-bg:         #f0fdf4;
  --green-border:     #86efac;
  --green-text:       #166534;

  --amber-bg:         #fefce8;
  --amber-border:     #fde047;
  --amber-text:       #92400e;

  --red-bg:           #fef2f2;
  --red-border:       #fca5a5;
  --red-text:         #991b1b;

  --font-sans:        'Inter', system-ui, sans-serif;
  --font-mono:        'JetBrains Mono', monospace; /* for uptime %, timestamps */
}
```

---

## ENVIRONMENT VARIABLES

```bash
# .env.example

# Aggregator
STATUS_API_KEY=your-secret-key-here
BACKEND_HEALTH_URL=https://api.planoo.tech/health
REDIS_URL=redis://localhost:6379
MONGO_URI=mongodb://localhost:27017/planoo
SMTP_HOST=smtp.planoo.tech
SMTP_PORT=587
SMTP_USER=monitor@planoo.tech
SMTP_PASS=smtp-password

# Frontend
VITE_STATUS_API_KEY=your-secret-key-here
VITE_API_BASE_URL=https://status.planoo.tech
```

---

## DOCKER COMPOSE

```yaml
# docker-compose.yml
version: "3.9"
services:
  aggregator:
    build: ./apps/aggregator
    ports: ["3001:3001"]
    env_file: .env
    restart: unless-stopped

  frontend:
    build: ./apps/frontend
    ports: ["80:80"]
    environment:
      - VITE_STATUS_API_KEY=${STATUS_API_KEY}
      - VITE_API_BASE_URL=http://aggregator:3001
    depends_on: [aggregator]
    restart: unless-stopped
```

---

## ACCEPTANCE CRITERIA

- [ ] Page loads at `status.planoo.tech` and auto-refreshes every 5 seconds
- [ ] All 5 service tiles render with correct name, status icon, health score, response time, and last-checked time
- [ ] 90-bar uptime history strip renders for each service; hovering a bar shows the tooltip
- [ ] Global banner changes colour correctly: green → amber → red based on overall status
- [ ] If Backend is `outage`, all dependent services show `degraded` in the UI regardless of raw check result
- [ ] Health endpoint returns 401 for requests without a valid `x-api-key`
- [ ] Hysteresis: a single failed check does not flip status to `outage`; requires 3 consecutive failures
- [ ] Works fully with mocked checkers (each checker file can export a mock flag)
- [ ] `docker-compose up` brings the full stack online with zero additional config beyond `.env`
- [ ] Adding a 6th service requires only: one new checker file + one entry in the services config array

---

## PHASED EXPANSION PLAN

| Phase | Scope | Timeline |
|---|---|---|
| **MVP** | 5 tiles, polling, basic aggregation, API key auth | Week 1 |
| **Phase 2** | SSE real-time push, hysteresis, cascade logic | Week 2 |
| **Phase 3** | 90-day history persistence (Redis or SQLite), richer health metrics | Week 3 |
| **Phase 4** | Email/webhook alerts on status change, public incident timeline | Week 4 |

---

## HOW TO EXTEND TO A NEW SERVICE

1. Create `apps/aggregator/src/checkers/checkNewService.js` — export an async `check()` function
2. Add the service entry to `SERVICES_CONFIG` in `aggregator/src/index.js`:
   ```js
   { id: "newservice", name: "New Service", weight: 0.XX, checker: checkNewService }
   ```
3. Add the service tile to the frontend mock in `apps/frontend/src/mocks/services.js`
4. Deploy — no other changes needed

---

*Prompt authored for Antigravity · status.planoo.tech · April 2026*
