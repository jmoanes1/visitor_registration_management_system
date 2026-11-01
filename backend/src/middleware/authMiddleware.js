import { verifyToken, getJwtSecret } from '../services/authService.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized: No token provided');
    error.statusCode = 401;
    return next(error);
  }

  if (!getJwtSecret()) {
    const error = new Error('Authentication is not configured: missing JWT_SECRET');
    error.statusCode = 500;
    return next(error);
  }

  try {
    req.auth = await verifyToken(authHeader.slice(7));
  } catch {
    const error = new Error('Unauthorized: Invalid token');
    error.statusCode = 401;
    return next(error);
  }

  next();
};

export default authMiddleware;
