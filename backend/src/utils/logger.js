import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.resolve(__dirname, '../../../logs');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Console format — readable for dev
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  })
);

// File format — structured JSON for parsing
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'http',
  transports: [
    // Console (dev only)
    ...(process.env.NODE_ENV !== 'production'
      ? [new winston.transports.Console({ format: consoleFormat })]
      : []),

    // App logs — combined (info, http, warn)
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'app', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: fileFormat,
      maxFiles: '14d',
      maxSize: '50m',
      zippedArchive: true,
    }),

    // Error logs — errors only
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
    }),
  ],

  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error', 'exception-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '30d',
    }),
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error', 'rejection-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxFiles: '30d',
    }),
  ],

  exitOnError: false,
});

export default logger;
