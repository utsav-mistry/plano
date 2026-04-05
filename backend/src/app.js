import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { setupSwagger } from './config/swagger.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import productRoutes from './modules/products/product.routes.js';
import planRoutes from './modules/plans/plan.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscription.routes.js';
import quotationRoutes from './modules/quotations/quotation.routes.js';
import invoiceRoutes from './modules/invoices/invoice.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import discountRoutes from './modules/discounts/discount.routes.js';
import taxRoutes from './modules/taxes/tax.routes.js';
import reportRoutes from './modules/reports/report.routes.js';

const app = express();

// ─── Public Health Check (open CORS) ─────────────────────────
app.get('/health', (req, res) => {
  const mem = process.memoryUsage();
  const toMb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    status: 'ok',
    service: 'plano-api',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    pid: process.pid,
    memoryMb: {
      rss: toMb(mem.rss),
      heapTotal: toMb(mem.heapTotal),
      heapUsed: toMb(mem.heapUsed),
      external: toMb(mem.external),
    },
  });
});

// ─── Security ────────────────────────────────────────────────
const defaultCorsOrigins = [
  'https://planoo.tech',
  'https://www.planoo.tech',
  'https://admin.planoo.tech',
  'https://portal.planoo.tech',
];

const configuredCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsWhitelist = new Set([...defaultCorsOrigins, ...configuredCorsOrigins]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || corsWhitelist.has(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
  maxAge: 86400,
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body Parsing ─────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Rate Limiting ────────────────────────────────────────────
app.use(globalLimiter);

// ─── Request Logging ──────────────────────────────────────────
app.use(requestLogger);

// ─── API Routes ───────────────────────────────────────────────
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/plans`, planRoutes);
app.use(`${API_PREFIX}/subscriptions`, subscriptionRoutes);
app.use(`${API_PREFIX}/quotations`, quotationRoutes);
app.use(`${API_PREFIX}/invoices`, invoiceRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/discounts`, discountRoutes);
app.use(`${API_PREFIX}/taxes`, taxRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);

// ─── Swagger ──────────────────────────────────────────────────
setupSwagger(app);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
