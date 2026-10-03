/**
 * Centralized Express Error Handling Middleware.
 * Captures all uncaught errors across API routes and returns standardized JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal Server Error";

  console.error(`❌ [SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
