// config/logger.js
const { createLogger, transports, format } = require('winston');

const logger = createLogger({
  level: 'info', // Can be set to 'debug' in development
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Console output
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    // File logs
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
