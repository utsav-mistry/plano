/**
 * Plano Status Server — zero npm dependencies
 * Uses only Node.js built-ins: http, net, fs, path, fetch (Node 18+)
 *
 * Routes:
 *   /           → public/index.html  (status page)
 *   /api/health → JSON health data   (polled every 5s)
 *   /api/stream → SSE live push
 */

import http from 'http';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env without dotenv ───────────────────────────────────────────────
try {
  const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env optional */ }

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 4000;
const POLL_MS = 5000;
const HYSTERESIS = 3;          // failures before "outage"
const USE_MOCK = process.env.MOCK_CHECKERS === 'true';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;
const REDIS_PASS = process.env.REDIS_PASSWORD || null;

const WEIGHTS = { backend: 0.30, frontend: 0.20, mongodb: 0.20, redis: 0.15, bullmq: 0.10, smtp: 0.05 };

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(`Timeout (${ms}ms)`)), ms)),
  ]);
}

/** TCP reachability — just checks the port opens */
function tcpPing(host, port, ms = 3000) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host, port });
    const timer = setTimeout(() => { sock.destroy(); reject(new Error(`TCP timeout ${host}:${port}`)); }, ms);
    sock.on('connect', () => { clearTimeout(timer); sock.destroy(); resolve(); });
    sock.on('error', e => { clearTimeout(timer); reject(e); });
  });
}

/** Redis PING via raw RESP protocol — no ioredis needed */
function redisPing() {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection({ host: REDIS_HOST, port: REDIS_PORT });
    const timer = setTimeout(() => { sock.destroy(); reject(new Error('Redis timeout')); }, 2000);
    let buf = '';
    sock.on('connect', () => {
      // AUTH if password set, then PING
      const cmd = REDIS_PASS
        ? `*2\r\n$4\r\nAUTH\r\n$${REDIS_PASS.length}\r\n${REDIS_PASS}\r\n*1\r\n$4\r\nPING\r\n`
        : `*1\r\n$4\r\nPING\r\n`;
      sock.write(cmd);
    });
    sock.on('data', chunk => {
      buf += chunk.toString();
      if (buf.includes('+PONG') || buf.includes('+OK') && buf.includes('+PONG')) {
        clearTimeout(timer); sock.destroy(); resolve();
      } else if (buf.includes('-ERR') || buf.includes('-WRONGPASS')) {
        clearTimeout(timer); sock.destroy(); reject(new Error(buf.trim()));
      }
    });
    sock.on('error', e => { clearTimeout(timer); reject(e); });
  });
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 90-DAY HISTORY  (in-memory)
// ─────────────────────────────────────────────────────────────────────────────
const store = {};

function seed(id) {
  const m = new Map();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = fmtDate(d);
    const r = Math.random();
    const status = r < 0.01 ? 'outage' : r < 0.04 ? 'degraded' : 'operational';
    m.set(date, {
      date, status,
      uptimePercent: status === 'operational' ? 100
        : status === 'degraded' ? +(82 + Math.random() * 13).toFixed(1)
          : +(55 + Math.random() * 20).toFixed(1),
    });
  }
  store[id] = m;
}

function recordToday(id, status) {
  const today = fmtDate(new Date());
  store[id].set(today, { date: today, status, uptimePercent: status === 'operational' ? 100 : status === 'degraded' ? 80 : 50 });
  if (store[id].size > 90) store[id].delete(store[id].keys().next().value);
}

const getHistory = id => Array.from(store[id].values());
const getAvgUptime = id => {
  const arr = getHistory(id);
  return +(arr.reduce((s, d) => s + d.uptimePercent, 0) / arr.length).toFixed(2);
};

// ─────────────────────────────────────────────────────────────────────────────
// HYSTERESIS
// ─────────────────────────────────────────────────────────────────────────────
const failures = {};
const backoffCtr = {};

const statusOf = id => { const f = failures[id] || 0; return f === 0 ? 'operational' : f < HYSTERESIS ? 'degraded' : 'outage'; };
const calcHealth = (id, ms) => Math.max(0, Math.min(100, 100 - (failures[id] || 0) * 15 - (ms > 1000 ? 10 : 0) - (ms > 3000 ? 20 : 0)));
function shouldBackoff(id) {
  if ((failures[id] || 0) < HYSTERESIS) return false;
  backoffCtr[id] = (backoffCtr[id] || 0) + 1;
  return backoffCtr[id] > 3 && backoffCtr[id] % 2 === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKERS — built-in Node only
// ─────────────────────────────────────────────────────────────────────────────
async function checkBackend() {
  const url = process.env.BACKEND_HEALTH_URL || 'http://localhost:5000/health';
  const res = await withTimeout(fetch(url), 3000);
  const body = await res.json().catch(() => ({}));
  if (body?.status !== 'ok') throw new Error(`Unexpected: ${JSON.stringify(body)}`);
}

async function checkFrontend() {
  const url = process.env.FRONTEND_HEALTH_URL || 'http://localhost:3000';
  const res = await withTimeout(fetch(url), 3000);
  if (!res.ok) throw new Error(`Frontend returned ${res.status}`);
}

async function checkMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/plano';
  const m = uri.match(/mongodb:\/\/(?:[^@]+@)?([^/:]+)(?::(\d+))?/);
  const host = m?.[1] || 'localhost';
  const port = parseInt(m?.[2]) || 27017;
  await tcpPing(host, port, 2000);
}

async function checkSMTP() {
  const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  await tcpPing(host, port, 5000);
}

const CHECKERS = {
  backend: checkBackend,
  frontend: checkFrontend,
  mongodb: checkMongo,
  redis: redisPing,
  bullmq: redisPing,   // BullMQ health = Redis is reachable + responding
  smtp: checkSMTP,
};

const SERVICES = [
  { id: 'backend', name: 'Backend' },
  { id: 'frontend', name: 'Frontend' },
  { id: 'mongodb', name: 'MongoDB' },
  { id: 'redis', name: 'Redis' },
  { id: 'bullmq', name: 'BullMQ' },
  { id: 'smtp', name: 'SMTP' },
];
SERVICES.forEach(s => seed(s.id));

// ─────────────────────────────────────────────────────────────────────────────
// CHECK + AGGREGATE
// ─────────────────────────────────────────────────────────────────────────────
async function checkOne({ id, name }) {
  if (shouldBackoff(id)) {
    return { id, name, status: statusOf(id), responseTimeMs: null, lastChecked: new Date().toISOString(), healthScore: calcHealth(id, 9999), consecutiveFailures: failures[id] || 0, error: 'Backoff', uptimeHistory: getHistory(id), uptimePercent: getAvgUptime(id) };
  }
  if (USE_MOCK) {
    const ms = Math.floor(15 + Math.random() * 85);
    await new Promise(r => setTimeout(r, ms));
    failures[id] = 0; backoffCtr[id] = 0;
    recordToday(id, 'operational');
    return { id, name, status: 'operational', responseTimeMs: ms, lastChecked: new Date().toISOString(), healthScore: 100, consecutiveFailures: 0, error: null, uptimeHistory: getHistory(id), uptimePercent: getAvgUptime(id) };
  }
  const start = Date.now(); let status, error = null;
  try {
    await CHECKERS[id](); failures[id] = 0; backoffCtr[id] = 0; status = 'operational';
  } catch (e) {
    failures[id] = (failures[id] || 0) + 1; status = statusOf(id); error = e.message;
  }
  const ms = Date.now() - start;
  recordToday(id, status);
  return { id, name, status, responseTimeMs: ms, lastChecked: new Date().toISOString(), healthScore: calcHealth(id, ms), consecutiveFailures: failures[id] || 0, error, uptimeHistory: getHistory(id), uptimePercent: getAvgUptime(id) };
}

function cascade(services) {
  const down = services.find(s => s.id === 'backend')?.status === 'outage';
  return services.map(s => (s.id !== 'backend' && down && s.status === 'operational') ? { ...s, status: 'degraded', cascaded: true } : s);
}

function computeOverall(services) {
  let score = services.reduce((a, s) => a + (WEIGHTS[s.id] || 0) * (s.status === 'operational' ? 1 : s.status === 'degraded' ? 0.5 : 0), 0);
  if (services.find(s => s.id === 'backend')?.status === 'outage') score = Math.min(score, 0.3);
  return {
    status: score > 0.9 ? 'operational' : score > 0.5 ? 'degraded' : 'outage',
    uptimePercent: +(score * 100).toFixed(2),
    message: score > 0.9 ? 'All systems operational' : score > 0.5 ? 'Partial degradation' : 'Service outage in progress',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POLLING LOOP
// ─────────────────────────────────────────────────────────────────────────────
let latestData = null;
const sseClients = new Set();

async function runChecks() {
  const raw = await Promise.all(SERVICES.map(checkOne));
  const services = cascade(raw);
  latestData = { timestamp: new Date().toISOString(), overall: computeOverall(services), services };
  const payload = `event: health\ndata: ${JSON.stringify(latestData)}\n\n`;
  sseClients.forEach(res => { try { res.write(payload); } catch { } });
}
runChecks().catch(console.error);
setInterval(() => runChecks().catch(console.error), POLL_MS);

// ─────────────────────────────────────────────────────────────────────────────
// HTTP SERVER  (no express — pure Node built-in)
// ─────────────────────────────────────────────────────────────────────────────
const HTML_PATH = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Health JSON
  if (url === '/api/health') {
    if (!latestData) { res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'Not ready' })); }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    return res.end(JSON.stringify(latestData));
  }

  // SSE stream
  if (url === '/api/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    if (latestData) res.write(`event: health\ndata: ${JSON.stringify(latestData)}\n\n`);
    sseClients.add(res);
    const hb = setInterval(() => { try { res.write(': heartbeat\n\n'); } catch { } }, 15000);
    req.on('close', () => { clearInterval(hb); sseClients.delete(res); });
    return;
  }

  // All other routes → serve index.html
  fs.readFile(HTML_PATH, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

function startServer(port) {
  const s = server.listen(port, () => {
    console.log(`\n🟢  Plano Status → http://localhost:${port}`);
    console.log(`   No npm packages — pure Node.js built-ins only`);
    USE_MOCK && console.log('   ⚡ MOCK mode — simulated checks\n');
  });

  s.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use! Trying fallback port 8000...`);
      if (port !== 8000) return startServer(8000);
      console.error('❌ Fallback port 8000 is also in use. Exiting.');
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);
