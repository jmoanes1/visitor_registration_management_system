import httpError from '../utils/httpError.js';

// Returned for any /api path that no router claims, instead of the HTML 404 page.
const notFound = (req, res, next) => {
  next(httpError(404, `No route for ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isUnexpected = statusCode >= 500;

  if (isUnexpected) console.error(err);

  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && isUnexpected && { stack: err.stack }),
  });
};

export { errorHandler, notFound };
