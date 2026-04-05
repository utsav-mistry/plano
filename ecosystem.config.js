// ecosystem.config.js — Plano PM2 Process Manager
// Usage:
//   pm2 start ecosystem.config.js          (first time)
//   pm2 reload all                          (zero-downtime update)
//   pm2 save                                (persist across reboots)

module.exports = {
  apps: [
    // ── Next.js Frontend ───────────────────────────────────────
    {
      name: "frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run start -- -p 3000",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "500M",
      kill_timeout: 5000,
      out_file: "../logs/app/frontend.log",
      error_file: "../logs/error/frontend.log",
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://api.planoo.tech/api/v1"
      }
    },

    // ── Express API ────────────────────────────────────────────
    {
      name: "backend",
      cwd: "./backend",
      script: "server.js",
      instances: "max",               // One per CPU core
      exec_mode: "cluster",
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "500M",
      kill_timeout: 5000,
      out_file: "../logs/app/backend.log",
      error_file: "../logs/error/backend.log",
      merge_logs: true,
      time: true
    },

    // ── BullMQ Background Workers ──────────────────────────────
    {
      name: "workers",
      cwd: "./backend",
      script: "src/workers/index.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "300M",
      kill_timeout: 5000,
      out_file: "../logs/app/workers.log",
      error_file: "../logs/error/workers.log",
      merge_logs: true,
      time: true
    },

    // ── BullMQ Status Board ────────────────────────────────────
    {
      name: "status",
      cwd: "./status",
      script: "server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "200M",
      kill_timeout: 5000,
      out_file: "../logs/app/status.log",
      error_file: "../logs/error/status.log",
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: 8000,
        FRONTEND_HEALTH_URL: process.env.FRONTEND_HEALTH_URL || process.env.FRONTEND_URL || "https://planoo.tech"
      }
    }
  ]
};
