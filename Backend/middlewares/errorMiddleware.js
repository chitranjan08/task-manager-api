const AppError = require('../utils/AppError');
const ERROR_CODES = require('../utils/errorCodes');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const isCustom = err instanceof AppError;

  let message = err.message || 'Internal Server Error';
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  logger.error('❌ Unhandled Error:', {
    message: err.message,
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });
  // Handle Mongoose CastError
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
    errorCode = ERROR_CODES.MONGO_CAST_ERROR;
  }

  // Handle Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    message = `Duplicate field: ${field} already exists`;
    statusCode = 400;
    errorCode = ERROR_CODES.DB_DUPLICATE_KEY;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
    errorCode = ERROR_CODES.MONGO_VALIDATION_ERROR;
  }

  if (err.code === 'ETIMEDOUT' || err.message.includes('timed out')) {
    message = 'The server took too long to respond';
    errorCode = ERROR_CODES.REQUEST_TIMEOUT;
    statusCode = 504;
  }

  if (err.code === 'ECONNREFUSED') {
    message = 'Connection refused. Target server might be down.';
    errorCode = 3002;
    statusCode = 502; // Bad Gateway
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_INVALID;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
    statusCode = 401;
    errorCode = ERROR_CODES.TOKEN_EXPIRED;
  }

  const response = {
    success: false,
    message,
    errorCode,
  };
  if (Array.isArray(err.errors)) {
    response.errors = err.errors;
  }
  res.status(statusCode).json(response);
  //   res.status(statusCode).json({
  //     success: false,
  //     message,
  //     errorCode
  //   });
};

module.exports = errorMiddleware;
