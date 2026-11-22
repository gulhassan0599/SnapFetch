import { logger } from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Custom user-friendly message for internal server errors
  const message =
    statusCode === 500
      ? "An unexpected error occurred while processing your request. Please try again later."
      : err.message || "Something went wrong.";

  // Log the internal error details & stack to console for debugging (never exposed to client)
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
