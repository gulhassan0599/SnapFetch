import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Use the error's descriptive message if provided, otherwise generic fallback
  const message =
    err.message ||
    (statusCode === 500
      ? "An unexpected error occurred while processing your request. Please try again later."
      : "Something went wrong.");

  // Log the internal error details & stack to console for debugging
  logger.error(
    `${req.method} ${req.originalUrl} - ${statusCode} - ${err.message}`,
    { stack: err.stack },
  );

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
