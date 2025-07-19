class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 1999) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode; // Now a number
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
