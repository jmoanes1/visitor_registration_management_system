import config from '../config.js';
import { verifyToken } from '../services/auth.js';
import httpError from '../utils/httpError.js';

// Populates req.auth with the verified token payload, or fails with 401.
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return next(httpError(401, 'Unauthorized: no token provided'));
  }

  if (!config.jwtSecret) {
    return next(httpError(500, 'Authentication is not configured: missing JWT_SECRET'));
  }

  try {
    req.auth = verifyToken(header.slice('Bearer '.length));
  } catch {
    return next(httpError(401, 'Unauthorized: invalid token'));
  }

  next();
};

export default requireAuth;
