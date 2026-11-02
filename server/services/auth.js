import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import config from '../config.js';
import httpError from '../utils/httpError.js';

// Compare without leaking how many leading characters matched, and without
// throwing when the two values differ in length.
const isSameSecret = (provided, expected) => {
  const providedBuffer = Buffer.from(String(provided ?? ''));
  const expectedBuffer = Buffer.from(String(expected));
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

const missingConfiguration = (keys) =>
  httpError(500, `Authentication is not configured: missing ${keys.join(', ')}`);

const authenticate = (email, password) => {
  const { email: expectedEmail, password: expectedPassword } = config.admin;

  const missingKeys = [];
  if (!expectedEmail) missingKeys.push('ADMIN_EMAIL');
  if (!expectedPassword) missingKeys.push('ADMIN_PASSWORD');
  if (missingKeys.length > 0) throw missingConfiguration(missingKeys);

  const emailMatches = isSameSecret(email, expectedEmail);
  const passwordMatches = isSameSecret(password, expectedPassword);
  if (!emailMatches || !passwordMatches) return null;

  return {
    id: 'u-001',
    email: expectedEmail,
    name: config.admin.name,
    role: 'Administrator',
  };
};

const issueToken = (user) => {
  if (!config.jwtSecret) throw missingConfiguration(['JWT_SECRET']);

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: crypto.randomUUID(),
    },
    config.jwtSecret,
    { algorithm: 'HS256', expiresIn: config.jwtExpiresIn }
  );
};

const verifyToken = (token) =>
  jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });

export { authenticate, issueToken, verifyToken };
