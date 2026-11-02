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

const authenticate = (username, password) => {
  const { username: expectedUsername, password: expectedPassword } = config.admin;

  if (!expectedPassword) throw missingConfiguration(['ADMIN_PASSWORD']);

  const usernameMatches = isSameSecret(username, expectedUsername);
  const passwordMatches = isSameSecret(password, expectedPassword);
  if (!usernameMatches || !passwordMatches) return null;

  return {
    id: 'u-001',
    username: expectedUsername,
    name: config.admin.name,
    role: 'Administrator',
  };
};

const issueToken = (user) => {
  if (!config.jwtSecret) throw missingConfiguration(['JWT_SECRET']);

  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
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
