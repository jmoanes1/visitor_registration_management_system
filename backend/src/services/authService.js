import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const timingSafeCompare = (provided, expected) => {
  const providedBuffer = Buffer.from(String(provided ?? ''));
  const expectedBuffer = Buffer.from(String(expected));
  if (providedBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
};

const configurationError = (keys) => {
  const error = new Error(`Authentication is not configured: missing ${keys.join(', ')}`);
  error.statusCode = 500;
  return error;
};

const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || '';
const getAdminPassword = () => process.env.ADMIN_PASSWORD || '';
const getAdminName = () => process.env.ADMIN_NAME || 'Admin User';
const getJwtSecret = () => process.env.JWT_SECRET || '';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '8h';

const authenticateUser = (email, password) => {
  const expectedEmail = getAdminEmail();
  const expectedPassword = getAdminPassword();

  const missing = [];
  if (!expectedEmail) missing.push('ADMIN_EMAIL');
  if (!expectedPassword) missing.push('ADMIN_PASSWORD');
  if (missing.length > 0) {
    throw configurationError(missing);
  }

  const emailMatches = timingSafeCompare(email, expectedEmail);
  const passwordMatches = timingSafeCompare(password, expectedPassword);

  if (!emailMatches || !passwordMatches) return null;

  return {
    id: 'u-001',
    email: expectedEmail,
    name: getAdminName(),
    role: 'Administrator',
  };
};

const issueToken = (user) => {
  const secret = getJwtSecret();
  if (!secret) throw configurationError(['JWT_SECRET']);

  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role, jti: crypto.randomUUID() },
    secret,
    { algorithm: 'HS256', expiresIn: getJwtExpiresIn() }
  );
};

const verifyToken = (token) =>
  jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });

export { authenticateUser, issueToken, verifyToken, getJwtSecret };
