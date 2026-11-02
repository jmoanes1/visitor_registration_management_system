import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { existsSync } from 'node:fs';
import config from './config.js';
import authRoutes from './routes/auth.js';
import visitorRoutes from './routes/visitors.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';
import staffRoutes from './routes/staff.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

const isSameOrigin = (origin, request) => {
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
};

// Same-origin requests need no permission. An explicit allowlist covers the case
// where the SPA is hosted somewhere other than this API.
const corsDelegate = (req, callback) => {
  const { origin } = req.headers;

  if (!origin) return callback(null, { origin: false });

  const isAllowed =
    !config.isProduction ||
    config.allowedOrigins.has(origin) ||
    isSameOrigin(origin, req);

  callback(null, { origin: isAllowed ? origin : false, credentials: false });
};

app.use(cors(corsDelegate));
// The registration form sends visitor photos as base64 data URLs, which is far
// more than the 100 KB default.
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/staff', staffRoutes);

app.use('/api', notFound);

// One process serves both the API and the built SPA, so the browser keeps using
// relative /api requests and never needs CORS.
if (existsSync(config.clientBuildDirectory)) {
  app.use(express.static(config.clientBuildDirectory, { index: false, maxAge: '1h' }));

  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => {
    res.sendFile(path.join(config.clientBuildDirectory, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
