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
      script: "frontend/node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "500M",
      out_file: "/dev/null",
      error_file: "/dev/null",
      env: {
        NODE_ENV: "production"
      }
    },

    // ── Express API ────────────────────────────────────────────
    {
      name: "backend",
      script: "backend/server.js",
      instances: "max",               // One per CPU core
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "500M",
      out_file: "/dev/null",          // Winston handles all logging
      error_file: "/dev/null"
    },

    // ── BullMQ Background Workers ──────────────────────────────
    {
      name: "workers",
      script: "backend/src/workers/index.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "300M",
      out_file: "/dev/null",
      error_file: "/dev/null"
    },

    // ── BullMQ Status Board ────────────────────────────────────
    {
      name: "status",
      script: "status/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "200M",
      out_file: "/dev/null",
      error_file: "/dev/null"
    }
  ]
};
