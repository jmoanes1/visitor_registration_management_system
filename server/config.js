import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(serverDirectory, '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

const listFromEnv = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const clientBuildDirectory = path.join(projectRoot, 'dist');

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  clientBuildDirectory,
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  admin: {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'Admin User',
  },
  // Browsers send no cross-origin request when the API serves the SPA itself, so
  // this list is only needed when the two live on different domains.
  allowedOrigins: new Set(listFromEnv(process.env.CORS_ALLOWED_ORIGINS)),
};

export default config;
