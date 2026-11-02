import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/authRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

const clientDist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/dist'
);
const hasClientBuild = existsSync(clientDist);

// Single-domain deployment: browsers send no cross-origin requests in production,
// so only same-origin plus an optional explicit allowlist is accepted.
const allowedOrigins = new Set(
  (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const isSameOrigin = (origin, request) => {
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
};

const corsDelegate = (req, callback) => {
  const { origin } = req.headers;

  if (!origin) return callback(null, { origin: false });

  const isProduction = process.env.NODE_ENV === 'production';
  const allowed = !isProduction || allowedOrigins.has(origin) || isSameOrigin(origin, req);

  callback(null, { origin: allowed ? origin : false, credentials: false });
};

app.use(cors(corsDelegate));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', staffRoutes);

// One-service deployment: the same process that answers /api also serves the
// built SPA, so the frontend keeps using relative /api requests.
if (hasClientBuild) {
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));

  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
