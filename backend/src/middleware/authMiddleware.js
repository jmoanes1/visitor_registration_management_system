const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Unauthorized: No token provided');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  if (token !== 'dev-mock-token') {
    const error = new Error('Unauthorized: Invalid token');
    error.statusCode = 401;
    return next(error);
  }

  next();
};

export default authMiddleware;
